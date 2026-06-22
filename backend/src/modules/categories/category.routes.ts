import type { FastifyInstance } from "fastify";
import {
  createCategoryController,
  getCategoryByIdController,
  listCategoriesController,
} from "./category.controller.js";
import {
  categoryIdParamsSchema,
  createCategoryBodySchema,
} from "./category.schema.js";
import type {
  CategoryParams,
  CreateCategoryInput,
} from "./category.types.js";

export async function categoryRoutes(app: FastifyInstance) {
  // Listar todas as categorias
  app.get("/categorias", listCategoriesController);

  // Inserir uma categoria e seus tipos de ocorrência
  app.post<{ Body: CreateCategoryInput }>(
    "/categorias",
    {
      schema: {
        body: createCategoryBodySchema,
      },
    },
    createCategoryController,
  );

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
