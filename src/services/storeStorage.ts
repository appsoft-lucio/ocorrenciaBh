export type StoreStatus = 'Ativa' | 'Inativa'

export interface Store {
  id: string
  code: string
  name: string
  city: string
  address: string
  regional: string
  manager: string
  phone: string
  email: string
  employees: number
  openingHours: string
  status: StoreStatus
}

export const STORES_STORAGE_KEY = 'lojasBh'

const seedStores: Store[] = [
  {
    id: 'store-142',
    code: '142',
    name: 'Loja 142',
    city: 'Contagem',
    address: 'Av. João César de Oliveira, 1200',
    regional: 'Metropolitana',
    manager: 'Marcos Silva',
    phone: '(31) 3333-0142',
    email: 'loja142@supermercadosbh.com.br',
    employees: 84,
    openingHours: '07:00 às 22:00',
    status: 'Ativa',
  },
  {
    id: 'store-087',
    code: '087',
    name: 'Loja 087',
    city: 'Belo Horizonte',
    address: 'Av. Amazonas, 2850',
    regional: 'Belo Horizonte',
    manager: 'Carla Souza',
    phone: '(31) 3333-0087',
    email: 'loja087@supermercadosbh.com.br',
    employees: 96,
    openingHours: '07:00 às 23:00',
    status: 'Ativa',
  },
  {
    id: 'store-215',
    code: '215',
    name: 'Loja 215',
    city: 'Santa Luzia',
    address: 'Av. Brasília, 650',
    regional: 'Norte',
    manager: 'Renato Lima',
    phone: '(31) 3333-0215',
    email: 'loja215@supermercadosbh.com.br',
    employees: 71,
    openingHours: '07:00 às 22:00',
    status: 'Ativa',
  },
  {
    id: 'store-036',
    code: '036',
    name: 'Loja 036',
    city: 'Betim',
    address: 'Av. Edmeia Mattos Lazzarotti, 420',
    regional: 'Oeste',
    manager: 'Fernanda Alves',
    phone: '(31) 3333-0036',
    email: 'loja036@supermercadosbh.com.br',
    employees: 63,
    openingHours: '08:00 às 21:00',
    status: 'Ativa',
  },
]

export function loadStores(): Store[] {
  try {
    const stored = localStorage.getItem(STORES_STORAGE_KEY)
    if (!stored) {
      saveStores(seedStores)
      return seedStores
    }

    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed as Store[] : seedStores
  } catch {
    return seedStores
  }
}

export function saveStores(stores: Store[]) {
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores))
}
