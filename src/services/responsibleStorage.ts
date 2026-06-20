export type ResponsibleStatus = 'Disponível' | 'Indisponível' | 'Férias'

export interface ResponsibleAssignment {
  id: string
  employeeRegistration: string
  employeeName: string
  role: string
  store: string
  category: string
  shift: string
  phone: string
  email: string
  status: ResponsibleStatus
  isPrimary: boolean
}

const RESPONSIBLES_STORAGE_KEY = 'responsaveisBh'

export function loadResponsibles(): ResponsibleAssignment[] {
  try {
    const stored = localStorage.getItem(RESPONSIBLES_STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed as ResponsibleAssignment[] : []
  } catch {
    return []
  }
}

export function saveResponsibles(responsibles: ResponsibleAssignment[]) {
  localStorage.setItem(RESPONSIBLES_STORAGE_KEY, JSON.stringify(responsibles))
}
