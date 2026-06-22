import type { FastifyInstance } from "fastify";
import { findStoreById, listStores } from "./store.repository.js";

interface StoreParams {
  id: string;
}

export async function storeRoutes(app: FastifyInstance) {
  app.get("/lojas", async (_request, reply) => {
    try {
      const stores = await listStores();
      return { data: stores };
    } catch (error) {
      app.log.error(error, "Não foi possível consultar as lojas no Firebird");

      return reply.status(503).send({
        error: "DATABASE_UNAVAILABLE",
        message: "Não foi possível consultar as lojas.",
      });
    }
  });

  app.get<{ Params: StoreParams }>("/lojas/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.status(400).send({
        error: "INVALID_STORE_ID",
        message: "O ID da loja deve ser um número inteiro positivo.",
      });
    }

    try {
      const store = await findStoreById(id);

      if (!store) {
        return reply.status(404).send({
          error: "STORE_NOT_FOUND",
          message: "Loja não encontrada.",
        });
      }

      return { data: store };
    } catch (error) {
      app.log.error(error, "Não foi possível consultar a loja no Firebird");

      return reply.status(503).send({
        error: "DATABASE_UNAVAILABLE",
        message: "Não foi possível consultar a loja.",
      });
    }
  });
}
