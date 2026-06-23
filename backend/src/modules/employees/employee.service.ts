import {
  findEmployeeById as findEmployeeByIdRepository,
  listEmployees as listEmployeesRepository,
} from "./employee.repository.js";

export class EmployeeNotFoundError extends Error {
  constructor() {
    super("Funcionário não encontrado.");
    this.name = "EmployeeNotFoundError";
  }
}

// Listar todos os funcionários
export async function listEmployees() {
  return listEmployeesRepository();
}

// Buscar um funcionário pelo ID
export async function getEmployeeById(id: number) {
  const employee = await findEmployeeByIdRepository(id);

  if (!employee) {
    throw new EmployeeNotFoundError();
  }

  return employee;
}
