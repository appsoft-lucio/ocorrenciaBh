import Fastify from "fastify";
import { checkDatabaseConnection } from "./config/database.js";
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

  app.register(storeRoutes);

  return app;
}
