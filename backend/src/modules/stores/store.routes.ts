import type { FastifyInstance } from "fastify";
import {
  getStoreByIdController,
  listStoresController,
} from "./store.controller.js";
import { storeIdParamsSchema } from "./store.schema.js";
import type { StoreParams } from "./store.types.js";

export async function storeRoutes(app: FastifyInstance) {
  app.get("/lojas", listStoresController);

  app.get<{ Params: StoreParams }>(
    "/lojas/:id",
    {
      schema: {
        params: storeIdParamsSchema,
      },
    },
    getStoreByIdController,
  );
}
