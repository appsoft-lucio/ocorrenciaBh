import type { FastifyInstance } from "fastify";
import {
  createStoreController,
  getStoreByIdController,
  listStoresController,
} from "./store.controller.js";
import {
  createStoreBodySchema,
  storeIdParamsSchema,
} from "./store.schema.js";
import type { CreateStoreInput, StoreParams } from "./store.types.js";

export async function storeRoutes(app: FastifyInstance) {
  app.get("/lojas", listStoresController);

  app.post<{ Body: CreateStoreInput }>(
    "/lojas",
    {
      schema: {
        body: createStoreBodySchema,
      },
    },
    createStoreController,
  );

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
