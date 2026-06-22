import { query } from "../../config/database.js";
import type {
  CreateStoreInput,
  Store,
  StoreStatus,
  UpdateStoreInput,
} from "./store.types.js";

interface StoreRow {
  id: number;
  codigo: string;
  nome: string;
  cidade: string | null;
  endereco: string | null;
  regional: string | null;
  gerente: string | null;
  telefone: string | null;
  email: string | null;
  horario_funcionamento: string | null;
  status: StoreStatus;
  criado_em: Date;
  atualizado_em: Date;
}

function mapStore(row: StoreRow): Store {
  return {
    id: row.id,
    code: row.codigo,
    name: row.nome,
    city: row.cidade,
    address: row.endereco,
    regional: row.regional,
    manager: row.gerente,
    phone: row.telefone,
    email: row.email,
    openingHours: row.horario_funcionamento,
    status: row.status,
    createdAt: row.criado_em,
    updatedAt: row.atualizado_em,
  };
}

const storeFields = `
  ID,
  CODIGO,
  NOME,
  CIDADE,
  ENDERECO,
  REGIONAL,
  GERENTE,
  TELEFONE,
  EMAIL,
  HORARIO_FUNCIONAMENTO,
  STATUS,
  CRIADO_EM,
  ATUALIZADO_EM
`;

// Listar todas as lojas no banco de dados
export async function listStores(): Promise<Store[]> {
  const rows = await query<StoreRow>(`
    SELECT ${storeFields}
    FROM LOJAS
    ORDER BY CODIGO
  `);

  return rows.map(mapStore);
}

// Buscar uma loja pelo ID no banco de dados
export async function findStoreById(id: number): Promise<Store | null> {
  const [row] = await query<StoreRow>(
    `SELECT ${storeFields} FROM LOJAS WHERE ID = ?`,
    [id],
  );

  return row ? mapStore(row) : null;
}

// Buscar uma loja pelo código para evitar duplicidade
export async function findStoreByCode(code: string): Promise<Store | null> {
  const [row] = await query<StoreRow>(
    `SELECT ${storeFields} FROM LOJAS WHERE CODIGO = ?`,
    [code],
  );

  return row ? mapStore(row) : null;
}

// Inserir uma nova loja no banco de dados
export async function createStore(input: CreateStoreInput): Promise<Store> {
  const [created] = await query<{ id: number }>(
    `
      INSERT INTO LOJAS (
        CODIGO,
        NOME,
        CIDADE,
        ENDERECO,
        REGIONAL,
        GERENTE,
        TELEFONE,
        EMAIL,
        HORARIO_FUNCIONAMENTO,
        STATUS
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING ID
    `,
    [
      input.code,
      input.name,
      input.city ?? null,
      input.address ?? null,
      input.regional ?? null,
      input.manager ?? null,
      input.phone ?? null,
      input.email ?? null,
      input.openingHours ?? null,
      input.status ?? "ATIVA",
    ],
  );

  const store = created ? await findStoreById(created.id) : null;

  if (!store) {
    throw new Error("A loja foi criada, mas não pôde ser consultada.");
  }

  return store;
}

// Atualizar uma loja no banco de dados
export async function updateStore(
  id: number,
  input: UpdateStoreInput,
): Promise<Store | null> {
  const columns: Record<keyof UpdateStoreInput, string> = {
    code: "CODIGO",
    name: "NOME",
    city: "CIDADE",
    address: "ENDERECO",
    regional: "REGIONAL",
    manager: "GERENTE",
    phone: "TELEFONE",
    email: "EMAIL",
    openingHours: "HORARIO_FUNCIONAMENTO",
    status: "STATUS",
  };
  const entries = Object.entries(input) as [
    keyof UpdateStoreInput,
    UpdateStoreInput[keyof UpdateStoreInput],
  ][];
  const assignments = entries.map(([field]) => `${columns[field]} = ?`);
  const values = entries.map(([, value]) => value ?? null);

  await query(
    `
      UPDATE LOJAS
      SET ${assignments.join(", ")},
          ATUALIZADO_EM = CURRENT_TIMESTAMP
      WHERE ID = ?
    `,
    [...values, id],
  );

  return findStoreById(id);
}

// Inativar uma loja no banco de dados sem apagar seu histórico
export async function deactivateStore(id: number): Promise<void> {
  await query(
    `
      UPDATE LOJAS
      SET STATUS = 'INATIVA',
          ATUALIZADO_EM = CURRENT_TIMESTAMP
      WHERE ID = ?
    `,
    [id],
  );
}
