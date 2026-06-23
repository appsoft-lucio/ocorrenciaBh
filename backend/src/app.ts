import Fastify from "fastify";
import { checkDatabaseConnection } from "./config/database.js";
import { categoryRoutes } from "./modules/categories/category.routes.js";
import { employeeRoutes } from "./modules/employees/employee.routes.js";
import { storeRoutes } from "./modules/stores/store.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => {
    const database = await checkDatabaseConnection();

    return {
      status: "ok",
      database,
      message: "Backend Ocorrências BH funcionando",
    };
  });

  app.register(categoryRoutes);
  app.register(employeeRoutes);
  app.register(storeRoutes);

  return app;
}
