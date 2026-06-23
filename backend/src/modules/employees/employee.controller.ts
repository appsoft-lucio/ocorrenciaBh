import type { FastifyReply, FastifyRequest } from "fastify";
import { parseEmployeeId } from "./employee.schema.js";
import {
  EmployeeNotFoundError,
  getEmployeeById,
  listEmployees,
} from "./employee.service.js";
import type { EmployeeParams } from "./employee.types.js";

// Listar todos os funcionários
export async function listEmployeesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const employees = await listEmployees();
    return { data: employees };
  } catch (error) {
    request.log.error(error, "Não foi possível consultar os funcionários");

    return reply.status(503).send({
      error: "DATABASE_UNAVAILABLE",
      message: "Não foi possível consultar os funcionários.",
    });
  }
}

// Buscar um funcionário pelo ID
export async function getEmployeeByIdController(
  request: FastifyRequest<{ Params: EmployeeParams }>,
  reply: FastifyReply,
) {
  const id = parseEmployeeId(request.params.id);

  if (!id) {
    return reply.status(400).send({
      error: "INVALID_EMPLOYEE_ID",
      message: "O ID do funcionário deve ser um número inteiro positivo.",
    });
  }

  try {
    const employee = await getEmployeeById(id);
    return { data: employee };
  } catch (error) {
    if (error instanceof EmployeeNotFoundError) {
      return reply.status(404).send({
        error: "EMPLOYEE_NOT_FOUND",
        message: error.message,
      });
    }

    request.log.error(error, "Não foi possível consultar o funcionário");

    return reply.status(503).send({
      error: "DATABASE_UNAVAILABLE",
      message: "Não foi possível consultar o funcionário.",
    });
  }
}
