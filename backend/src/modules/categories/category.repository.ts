import { query } from "../../config/database.js";
import type { Category, OccurrenceType } from "./category.types.js";

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
      ORDER BY NOME
    `,
    [id],
  );

  return mapCategory(category, typeRows.map(mapOccurrenceType));
}
