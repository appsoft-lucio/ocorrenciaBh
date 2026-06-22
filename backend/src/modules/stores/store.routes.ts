import type { FastifyInstance } from "fastify";
import {
  createStoreController,
  deactivateStoreController,
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
  // Listar todas as lojas
  app.get("/lojas", listStoresController);

  // Inserir uma nova loja
  app.post<{ Body: CreateStoreInput }>(
    "/lojas",
    {
      schema: {
        body: createStoreBodySchema,
      },
    },
    createStoreController,
  );

  // Buscar uma loja pelo ID
  app.get<{ Params: StoreParams }>(
    "/lojas/:id",
    {
      schema: {
        params: storeIdParamsSchema,
      },
    },
    getStoreByIdController,
  );

  // Atualizar uma loja pelo ID
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

  // Inativar uma loja pelo ID
  app.delete<{ Params: StoreParams }>(
    "/lojas/:id",
    {
      schema: {
        params: storeIdParamsSchema,
      },
    },
    deactivateStoreController,
  );
}
