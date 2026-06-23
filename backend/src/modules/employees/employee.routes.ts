import type { FastifyInstance } from "fastify";
import {
  getEmployeeByIdController,
  listEmployeesController,
} from "./employee.controller.js";
import { employeeIdParamsSchema } from "./employee.schema.js";
import type { EmployeeParams } from "./employee.types.js";

export async function employeeRoutes(app: FastifyInstance) {
  // Listar todos os funcionários
  app.get("/funcionarios", listEmployeesController);

  // Buscar um funcionário pelo ID
  app.get<{ Params: EmployeeParams }>(
    "/funcionarios/:id",
    {
      schema: {
        params: employeeIdParamsSchema,
      },
    },
    getEmployeeByIdController,
  );
}
