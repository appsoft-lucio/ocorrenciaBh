import { query } from "../../config/database.js";
import type {
  Employee,
  EmployeeSource,
  EmployeeStatus,
} from "./employee.types.js";

interface EmployeeRow {
  id: number;
  loja_id: number | null;
  loja_codigo: string | null;
  loja_nome: string | null;
  matricula: string;
  nome: string;
  setor: string | null;
  cargo: string | null;
  turno: string | null;
  telefone: string | null;
  email: string | null;
  data_admissao: Date | null;
  numero_armario: string | null;
  status: EmployeeStatus;
  origem: EmployeeSource;
  criado_em: Date;
  atualizado_em: Date;
}

function mapEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    storeId: row.loja_id,
    storeCode: row.loja_codigo,
    storeName: row.loja_nome,
    registration: row.matricula,
    name: row.nome,
    sector: row.setor,
    role: row.cargo,
    shift: row.turno,
    phone: row.telefone,
    email: row.email,
    admissionDate: row.data_admissao,
    lockerNumber: row.numero_armario,
    status: row.status,
    source: row.origem,
    createdAt: row.criado_em,
    updatedAt: row.atualizado_em,
  };
}

const employeeFields = `
  F.ID,
  F.LOJA_ID,
  L.CODIGO AS LOJA_CODIGO,
  L.NOME AS LOJA_NOME,
  F.MATRICULA,
  F.NOME,
  F.SETOR,
  F.CARGO,
  F.TURNO,
  F.TELEFONE,
  F.EMAIL,
  F.DATA_ADMISSAO,
  F.NUMERO_ARMARIO,
  F.STATUS,
  F.ORIGEM,
  F.CRIADO_EM,
  F.ATUALIZADO_EM
`;

// Listar todos os funcionários e suas lojas
export async function listEmployees(): Promise<Employee[]> {
  const rows = await query<EmployeeRow>(`
    SELECT ${employeeFields}
    FROM FUNCIONARIOS F
    LEFT JOIN LOJAS L ON L.ID = F.LOJA_ID
    ORDER BY F.NOME
  `);

  return rows.map(mapEmployee);
}

// Buscar um funcionário pelo ID
export async function findEmployeeById(id: number): Promise<Employee | null> {
  const [row] = await query<EmployeeRow>(
    `
      SELECT ${employeeFields}
      FROM FUNCIONARIOS F
      LEFT JOIN LOJAS L ON L.ID = F.LOJA_ID
      WHERE F.ID = ?
    `,
    [id],
  );

  return row ? mapEmployee(row) : null;
}
