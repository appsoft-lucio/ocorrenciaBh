export type OccurrenceStatus = 'Aberta' | 'Em análise' | 'Em andamento' | 'Resolvida' | 'Cancelada'

export interface StoredOccurrence {
  id: string
  title: string
  category: string
  store: string
  sector: string
  priority: string
  responsible: string
  description: string
  types: string[]
  image?: string
  status: OccurrenceStatus
  date: string
}

export const OCCURRENCES_STORAGE_KEY = 'ocorrenciasBh'

const seedOccurrences: StoredOccurrence[] = [
  {
    id: 'BH-0248',
    title: 'Câmara fria com defeito',
    category: 'Manutenção',
    store: 'Loja 142',
    sector: 'Açougue',
    priority: 'Alta',
    responsible: 'Manutenção',
    description: 'Equipamento não está mantendo a temperatura adequada.',
    types: ['Câmara fria com defeito'],
    status: 'Aberta',
    date: '20/06/2026 09:48',
  },
  {
    id: 'BH-0247',
    title: 'Divergência de caixa',
    category: 'Frente de Caixa',
    store: 'Loja 087',
    sector: 'Frente de caixa',
    priority: 'Média',
    responsible: 'Gerente',
    description: 'Diferença identificada no fechamento do caixa.',
    types: ['Divergência de caixa'],
    status: 'Em análise',
    date: '20/06/2026 09:25',
  },
  {
    id: 'BH-0246',
    title: 'Equipamento quebrado',
    category: 'Manutenção',
    store: 'Loja 215',
    sector: 'Padaria',
    priority: 'Média',
    responsible: 'Manutenção',
    description: 'Solicitação de substituição de equipamento.',
    types: ['Equipamento quebrado'],
    status: 'Em andamento',
    date: '20/06/2026 08:40',
  },
]

export function loadOccurrences(): StoredOccurrence[] {
  try {
    const stored = localStorage.getItem(OCCURRENCES_STORAGE_KEY)
    if (!stored) {
      saveOccurrences(seedOccurrences)
      return seedOccurrences
    }

    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed as StoredOccurrence[] : seedOccurrences
  } catch {
    return seedOccurrences
  }
}

export function saveOccurrences(occurrences: StoredOccurrence[]) {
  localStorage.setItem(OCCURRENCES_STORAGE_KEY, JSON.stringify(occurrences))
}

export function occurrenceDateValue(date: string) {
  const [datePart = '', timePart = '00:00'] = date.split(/[,\s]+/, 2)
  const [day, month, year] = datePart.split('/')
  const parsed = new Date(`${year}-${month}-${day}T${timePart}`).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}
