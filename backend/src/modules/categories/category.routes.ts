import type { FastifyInstance } from "fastify";
import {
  getCategoryByIdController,
  listCategoriesController,
} from "./category.controller.js";
import { categoryIdParamsSchema } from "./category.schema.js";
import type { CategoryParams } from "./category.types.js";

export async function categoryRoutes(app: FastifyInstance) {
  // Listar todas as categorias
  app.get("/categorias", listCategoriesController);

  // Buscar uma categoria pelo ID
  app.get<{ Params: CategoryParams }>(
    "/categorias/:id",
    {
      schema: {
        params: categoryIdParamsSchema,
      },
    },
    getCategoryByIdController,
  );
}
