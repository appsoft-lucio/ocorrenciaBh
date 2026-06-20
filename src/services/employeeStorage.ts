export type EmployeeStatus = 'Ativo' | 'Afastado' | 'Inativo'

export interface Employee {
  id: string
  registration: string
  name: string
  store: string
  sector: string
  role: string
  shift: string
  phone: string
  email: string
  admissionDate: string
  lockerNumber: string
  status: EmployeeStatus
  source: 'RH' | 'Manual'
  updatedAt: string
}

export interface HrSyncItem extends Employee {
  syncAction: 'Novo' | 'Atualização'
}

export interface HrSyncResult {
  items: HrSyncItem[]
  receivedAt: string
  source: string
}

const EMPLOYEES_STORAGE_KEY = 'colaboradoresBh'
const LAST_SYNC_STORAGE_KEY = 'colaboradoresBhUltimaSincronizacao'

const simulatedHrEmployees: Omit<Employee, 'id' | 'source' | 'updatedAt'>[] = [
  { registration: 'BH001842', name: 'Ana Paula Ribeiro', store: 'Loja 087', sector: 'Prevenção de Perdas', role: 'Fiscal de Loja', shift: 'Manhã', phone: '(31) 98871-2040', email: 'ana.ribeiro@empresa.com.br', admissionDate: '2021-03-15', lockerNumber: 'A-014', status: 'Ativo' },
  { registration: 'BH002175', name: 'Carlos Eduardo Santos', store: 'Loja 142', sector: 'Prevenção de Perdas', role: 'Fiscal de Loja', shift: 'Tarde', phone: '(31) 99714-3052', email: 'carlos.santos@empresa.com.br', admissionDate: '2022-08-01', lockerNumber: 'B-022', status: 'Ativo' },
  { registration: 'BH001306', name: 'Márcia de Oliveira', store: 'Loja 215', sector: 'Gerência', role: 'Gerente de Loja', shift: 'Comercial', phone: '(31) 99103-8842', email: 'marcia.oliveira@empresa.com.br', admissionDate: '2018-05-21', lockerNumber: 'G-003', status: 'Ativo' },
  { registration: 'BH003011', name: 'Lucas Ferreira Lima', store: 'Loja 036', sector: 'Frente de caixa', role: 'Operador de Caixa', shift: 'Noite', phone: '(31) 98412-7631', email: 'lucas.lima@empresa.com.br', admissionDate: '2024-01-08', lockerNumber: 'C-045', status: 'Ativo' },
  { registration: 'BH002644', name: 'Juliana Costa Mendes', store: 'Loja 087', sector: 'Recursos Humanos', role: 'Assistente de RH', shift: 'Comercial', phone: '(31) 99224-6190', email: 'juliana.mendes@empresa.com.br', admissionDate: '2023-02-13', lockerNumber: 'A-031', status: 'Afastado' },
  { registration: 'BH001998', name: 'Roberto Alves Gomes', store: 'Loja 142', sector: 'Manutenção', role: 'Técnico de Manutenção', shift: 'Manhã', phone: '(31) 99856-4412', email: 'roberto.gomes@empresa.com.br', admissionDate: '2020-10-05', lockerNumber: 'M-008', status: 'Ativo' },
]

export function loadEmployees(): Employee[] {
  try {
    const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed as Employee[] : []
  } catch {
    return []
  }
}

export function saveEmployees(employees: Employee[]) {
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees))
}

export function loadLastHrSync() {
  return localStorage.getItem(LAST_SYNC_STORAGE_KEY)
}

export async function fetchEmployeesFromHr(currentEmployees: Employee[]): Promise<HrSyncResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 1300))
  const currentRegistrations = new Set(currentEmployees.map((employee) => employee.registration))
  const receivedAt = new Date().toLocaleString('pt-BR')

  return {
    source: 'API RH Corporativo (simulação)',
    receivedAt,
    items: simulatedHrEmployees.map((employee) => ({
      ...employee,
      id: `employee-${employee.registration}`,
      source: 'RH',
      updatedAt: receivedAt,
      syncAction: currentRegistrations.has(employee.registration) ? 'Atualização' : 'Novo',
    })),
  }
}

export function applyHrSync(currentEmployees: Employee[], result: HrSyncResult) {
  const synchronized = new Map(currentEmployees.map((employee) => [employee.registration, employee]))

  result.items.forEach((item) => {
    const employee: Employee = {
      id: item.id,
      registration: item.registration,
      name: item.name,
      store: item.store,
      sector: item.sector,
      role: item.role,
      shift: item.shift,
      phone: item.phone,
      email: item.email,
      admissionDate: item.admissionDate,
      lockerNumber: item.lockerNumber,
      status: item.status,
      source: item.source,
      updatedAt: item.updatedAt,
    }
    synchronized.set(employee.registration, employee)
  })

  const employees = Array.from(synchronized.values())
  saveEmployees(employees)
  localStorage.setItem(LAST_SYNC_STORAGE_KEY, result.receivedAt)
  return employees
}
