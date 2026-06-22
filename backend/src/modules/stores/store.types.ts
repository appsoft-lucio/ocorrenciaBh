export type StoreStatus = "ATIVA" | "INATIVA";

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
  status: StoreStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreParams {
  id: string;
}
