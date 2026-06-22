import { query } from "../../config/database.js";

export interface Store {
  id: number;
  code: string;
  name: string;
  city: string | null;
  address: string | null;
  regional: string | null;
  manager: string | null;
  phone: string | null;
  email: string | null;
  openingHours: string | null;
  status: "ATIVA" | "INATIVA";
  createdAt: Date;
  updatedAt: Date;
}

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
  status: "ATIVA" | "INATIVA";
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

export async function listStores(): Promise<Store[]> {
  const rows = await query<StoreRow>(`
    SELECT ${storeFields}
    FROM LOJAS
    ORDER BY CODIGO
  `);

  return rows.map(mapStore);
}

export async function findStoreById(id: number): Promise<Store | null> {
  const [row] = await query<StoreRow>(
    `SELECT ${storeFields} FROM LOJAS WHERE ID = ?`,
    [id],
  );

  return row ? mapStore(row) : null;
}
