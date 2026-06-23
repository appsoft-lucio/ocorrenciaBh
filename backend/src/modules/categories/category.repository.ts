import { query, withTransaction } from "../../config/database.js";
import type {
  Category,
  CreateCategoryInput,
  OccurrenceType,
  UpdateCategoryInput,
} from "./category.types.js";

interface CategoryRow {
  id: number;
  nome: string;
  tipo: string | null;
  descricao: string | null;
  ativa: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

interface OccurrenceTypeRow {
  id: number;
  categoria_id: number;
  nome: string;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

function mapOccurrenceType(row: OccurrenceTypeRow): OccurrenceType {
  return {
    id: row.id,
    categoryId: row.categoria_id,
    name: row.nome,
    active: row.ativo,
    createdAt: row.criado_em,
    updatedAt: row.atualizado_em,
  };
}

function mapCategory(
  row: CategoryRow,
  occurrenceTypes: OccurrenceType[],
): Category {
  return {
    id: row.id,
    name: row.nome,
    type: row.tipo,
    description: row.descricao,
    active: row.ativa,
    createdAt: row.criado_em,
    updatedAt: row.atualizado_em,
    occurrenceTypes,
  };
}

const categoryFields = `
  ID,
  NOME,
  TIPO,
  DESCRICAO,
  ATIVA,
  CRIADO_EM,
  ATUALIZADO_EM
`;

const occurrenceTypeFields = `
  ID,
  CATEGORIA_ID,
  NOME,
  ATIVO,
  CRIADO_EM,
  ATUALIZADO_EM
`;

// Listar todas as categorias e seus tipos de ocorrência
export async function listCategories(): Promise<Category[]> {
  const categories = await query<CategoryRow>(`
    SELECT ${categoryFields}
    FROM CATEGORIAS
    ORDER BY NOME
  `);
  const typeRows = await query<OccurrenceTypeRow>(`
    SELECT ${occurrenceTypeFields}
    FROM TIPOS_OCORRENCIA
    WHERE ATIVO = TRUE
    ORDER BY CATEGORIA_ID, NOME
  `);
  const typesByCategory = new Map<number, OccurrenceType[]>();

  for (const row of typeRows) {
    const occurrenceType = mapOccurrenceType(row);
    const categoryTypes = typesByCategory.get(row.categoria_id) ?? [];
    categoryTypes.push(occurrenceType);
    typesByCategory.set(row.categoria_id, categoryTypes);
  }

  return categories.map((category) =>
    mapCategory(category, typesByCategory.get(category.id) ?? []),
  );
}

// Buscar uma categoria pelo ID e carregar seus tipos de ocorrência
export async function findCategoryById(id: number): Promise<Category | null> {
  const [category] = await query<CategoryRow>(
    `SELECT ${categoryFields} FROM CATEGORIAS WHERE ID = ?`,
    [id],
  );

  if (!category) {
    return null;
  }

  const typeRows = await query<OccurrenceTypeRow>(
    `
      SELECT ${occurrenceTypeFields}
      FROM TIPOS_OCORRENCIA
      WHERE CATEGORIA_ID = ?
        AND ATIVO = TRUE
      ORDER BY NOME
    `,
    [id],
  );

  return mapCategory(category, typeRows.map(mapOccurrenceType));
}

// Buscar uma categoria pelo nome para evitar duplicidade
export async function findCategoryByName(
  name: string,
): Promise<Category | null> {
  const [category] = await query<CategoryRow>(
    `SELECT ${categoryFields} FROM CATEGORIAS WHERE NOME = ?`,
    [name],
  );

  return category ? mapCategory(category, []) : null;
}

// Inserir uma categoria e seus tipos em uma única transação
export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const categoryId = await withTransaction(async (execute) => {
    const [created] = await execute<{ id: number }>(
      `
        INSERT INTO CATEGORIAS (NOME, TIPO, DESCRICAO, ATIVA)
        VALUES (?, ?, ?, TRUE)
        RETURNING ID
      `,
      [input.name, input.type ?? null, input.description ?? null],
    );

    for (const occurrenceType of input.occurrenceTypes) {
      await execute(
        `
          INSERT INTO TIPOS_OCORRENCIA (CATEGORIA_ID, NOME, ATIVO)
          VALUES (?, ?, TRUE)
        `,
        [created.id, occurrenceType],
      );
    }

    return created.id;
  });
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new Error("A categoria foi criada, mas não pôde ser consultada.");
  }

  return category;
}

// Atualizar uma categoria e sincronizar seus tipos em uma única transação
export async function updateCategory(
  id: number,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  await withTransaction(async (execute) => {
    const categoryColumns: Record<
      Exclude<keyof UpdateCategoryInput, "occurrenceTypes">,
      string
    > = {
      name: "NOME",
      type: "TIPO",
      description: "DESCRICAO",
      active: "ATIVA",
    };
    const categoryEntries = Object.entries(input).filter(
      ([field]) => field !== "occurrenceTypes",
    ) as [
      Exclude<keyof UpdateCategoryInput, "occurrenceTypes">,
      string | boolean | undefined,
    ][];

    if (categoryEntries.length > 0) {
      const assignments = categoryEntries.map(([field, value]) =>
        field === "active"
          ? `${categoryColumns[field]} = ${value ? "TRUE" : "FALSE"}`
          : `${categoryColumns[field]} = ?`,
      );
      const values = categoryEntries
        .filter(([field]) => field !== "active")
        .map(([, value]) => value ?? null);

      await execute(
        `
          UPDATE CATEGORIAS
          SET ${assignments.join(", ")},
              ATUALIZADO_EM = CURRENT_TIMESTAMP
          WHERE ID = ?
        `,
        [...values, id],
      );
    }

    if (input.occurrenceTypes) {
      await execute(
        `
          UPDATE TIPOS_OCORRENCIA
          SET ATIVO = FALSE,
              ATUALIZADO_EM = CURRENT_TIMESTAMP
          WHERE CATEGORIA_ID = ?
        `,
        [id],
      );

      for (const occurrenceType of input.occurrenceTypes) {
        await execute(
          `
            UPDATE OR INSERT INTO TIPOS_OCORRENCIA (
              CATEGORIA_ID,
              NOME,
              ATIVO,
              ATUALIZADO_EM
            )
            VALUES (?, ?, TRUE, CURRENT_TIMESTAMP)
            MATCHING (CATEGORIA_ID, NOME)
          `,
          [id, occurrenceType],
        );
      }
    }
  });

  return findCategoryById(id);
}

// Inativar uma categoria e seus tipos sem apagar o histórico
export async function deactivateCategory(id: number): Promise<void> {
  await withTransaction(async (execute) => {
    await execute(
      `
        UPDATE CATEGORIAS
        SET ATIVA = FALSE,
            ATUALIZADO_EM = CURRENT_TIMESTAMP
        WHERE ID = ?
      `,
      [id],
    );

    await execute(
      `
        UPDATE TIPOS_OCORRENCIA
        SET ATIVO = FALSE,
            ATUALIZADO_EM = CURRENT_TIMESTAMP
        WHERE CATEGORIA_ID = ?
      `,
      [id],
    );
  });
}
