export type EmployeeStatus = "ATIVO" | "AFASTADO" | "FERIAS" | "INATIVO";
export type EmployeeSource = "RH" | "MANUAL";

export interface Employee {
  id: number;
  storeId: number | null;
  storeCode: string | null;
  storeName: string | null;
  registration: string;
  name: string;
  sector: string | null;
  role: string | null;
  shift: string | null;
  phone: string | null;
  email: string | null;
  admissionDate: Date | null;
  lockerNumber: string | null;
  status: EmployeeStatus;
  source: EmployeeSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeParams {
  id: string;
}
