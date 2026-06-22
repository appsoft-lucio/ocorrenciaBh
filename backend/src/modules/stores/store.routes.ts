import type { FastifyInstance } from "fastify";
import {
  createStoreController,
  getStoreByIdController,
  listStoresController,
  updateStoreController,
} from "./store.controller.js";
import {
  createStoreBodySchema,
  storeIdParamsSchema,
  updateStoreBodySchema,
} from "./store.schema.js";
import type {
  CreateStoreInput,
  StoreParams,
  UpdateStoreInput,
} from "./store.types.js";

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

  app.put<{ Params: StoreParams; Body: UpdateStoreInput }>(
    "/lojas/:id",
    {
      schema: {
        params: storeIdParamsSchema,
        body: updateStoreBodySchema,
      },
    },
    updateStoreController,
  );
}
