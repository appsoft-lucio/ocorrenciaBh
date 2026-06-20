export type EmployeeStatus = 'Ativo' | 'Afastado' | 'Férias' | 'Inativo'

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

const storeTeams = ['Loja 036', 'Loja 087', 'Loja 142', 'Loja 215']

const staffingPlan = [
  { sector: 'Gerência', role: 'Gerente de Loja', amount: 1, shift: 'Comercial' },
  { sector: 'Gerência', role: 'Subgerente de Loja', amount: 2, shift: 'Comercial' },
  { sector: 'Administrativo', role: 'Auxiliar Administrativo', amount: 1, shift: 'Comercial' },
  { sector: 'Prevenção de Perdas', role: 'Encarregado de Prevenção', amount: 1, shift: 'Comercial' },
  { sector: 'Prevenção de Perdas', role: 'Fiscal de Loja', amount: 5, shift: 'Alternado' },
  { sector: 'Frente de caixa', role: 'Encarregado de Frente de Caixa', amount: 2, shift: 'Alternado' },
  { sector: 'Frente de caixa', role: 'Operador de Caixa', amount: 14, shift: 'Alternado' },
  { sector: 'Frente de caixa', role: 'Empacotador', amount: 4, shift: 'Alternado' },
  { sector: 'Tesouraria', role: 'Auxiliar de Tesouraria', amount: 2, shift: 'Alternado' },
  { sector: 'Mercearia', role: 'Encarregado de Mercearia', amount: 1, shift: 'Comercial' },
  { sector: 'Mercearia', role: 'Repositor de Mercadorias', amount: 10, shift: 'Alternado' },
  { sector: 'Açougue', role: 'Encarregado de Açougue', amount: 1, shift: 'Comercial' },
  { sector: 'Açougue', role: 'Açougueiro', amount: 4, shift: 'Alternado' },
  { sector: 'Açougue', role: 'Auxiliar de Açougue', amount: 3, shift: 'Alternado' },
  { sector: 'Padaria', role: 'Encarregado de Padaria', amount: 1, shift: 'Comercial' },
  { sector: 'Padaria', role: 'Padeiro', amount: 2, shift: 'Manhã' },
  { sector: 'Padaria', role: 'Confeiteiro', amount: 1, shift: 'Manhã' },
  { sector: 'Padaria', role: 'Atendente de Padaria', amount: 2, shift: 'Alternado' },
  { sector: 'Hortifrúti', role: 'Encarregado de Hortifrúti', amount: 1, shift: 'Comercial' },
  { sector: 'Hortifrúti', role: 'Repositor de Hortifrúti', amount: 3, shift: 'Alternado' },
  { sector: 'Frios e Laticínios', role: 'Encarregado de Frios', amount: 1, shift: 'Comercial' },
  { sector: 'Frios e Laticínios', role: 'Atendente de Frios', amount: 3, shift: 'Alternado' },
  { sector: 'Recebimento', role: 'Conferente de Mercadorias', amount: 2, shift: 'Manhã' },
  { sector: 'Depósito', role: 'Auxiliar de Depósito', amount: 2, shift: 'Alternado' },
  { sector: 'Limpeza', role: 'Auxiliar de Serviços Gerais', amount: 3, shift: 'Alternado' },
  { sector: 'Manutenção', role: 'Técnico de Manutenção', amount: 1, shift: 'Comercial' },
  { sector: 'Recursos Humanos', role: 'Assistente de RH', amount: 1, shift: 'Comercial' },
  { sector: 'E-commerce', role: 'Separador de Pedidos', amount: 1, shift: 'Alternado' },
]

const firstNames = [
  'Ana Paula', 'Carlos Eduardo', 'Márcia', 'Lucas', 'Juliana', 'Roberto', 'Fernanda',
  'Rafael', 'Patrícia', 'Diego', 'Camila', 'André', 'Vanessa', 'Bruno', 'Renata',
  'Gustavo', 'Aline', 'Marcelo', 'Débora', 'Thiago', 'Simone', 'Leandro', 'Natália',
  'Rodrigo', 'Elaine', 'Felipe', 'Adriana', 'Wesley', 'Cristiane', 'Daniel',
]

const lastNames = [
  'Ribeiro', 'Santos', 'Oliveira', 'Lima', 'Mendes', 'Gomes', 'Alves', 'Souza',
  'Ferreira', 'Costa', 'Martins', 'Pereira', 'Rocha', 'Carvalho', 'Barbosa',
  'Nascimento', 'Moreira', 'Cardoso', 'Teixeira', 'Correia',
]

function resolveShift(configuredShift: string, employeeIndex: number) {
  if (configuredShift !== 'Alternado') return configuredShift
  return ['Manhã', 'Tarde', 'Noite'][employeeIndex % 3]
}

function generateSimulatedHrEmployees(): Omit<Employee, 'id' | 'source' | 'updatedAt'>[] {
  let globalIndex = 0

  return storeTeams.flatMap((store, storeIndex) => {
    let locker = 1
    return staffingPlan.flatMap((position) =>
      Array.from({ length: position.amount }, (_, roleIndex) => {
        const index = globalIndex++
        const firstName = firstNames[index % firstNames.length]
        const lastName = lastNames[(index * 7 + storeIndex) % lastNames.length]
        const secondLastName = lastNames[(index * 11 + roleIndex + 3) % lastNames.length]
        const normalizedName = `${firstName}.${lastName}`
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replaceAll(' ', '.')
          .toLowerCase()
        const year = 2017 + (index % 9)
        const month = String((index % 12) + 1).padStart(2, '0')
        const day = String((index % 27) + 1).padStart(2, '0')
        const status: EmployeeStatus = index % 89 === 0
          ? 'Inativo'
          : index % 37 === 0
            ? 'Afastado'
            : index % 29 === 0
              ? 'Férias'
            : 'Ativo'

        return {
          registration: `BH${String(1000 + index).padStart(6, '0')}`,
          name: `${firstName} ${lastName} ${secondLastName}`,
          store,
          sector: position.sector,
          role: position.role,
          shift: resolveShift(position.shift, index),
          phone: `(31) 9${String(8000 + (index % 1999)).padStart(4, '0')}-${String(1000 + ((index * 37) % 8999)).padStart(4, '0')}`,
          email: `${normalizedName}.${store.replace(/\D/g, '')}@empresa.com.br`,
          admissionDate: `${year}-${month}-${day}`,
          lockerNumber: `${String.fromCharCode(65 + storeIndex)}-${String(locker++).padStart(3, '0')}`,
          status,
        }
      }),
    )
  })
}

const simulatedHrEmployees = generateSimulatedHrEmployees()

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
