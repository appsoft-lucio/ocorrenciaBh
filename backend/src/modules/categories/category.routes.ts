import type { FastifyInstance } from "fastify";
import {
  createCategoryController,
  deactivateCategoryController,
  getCategoryByIdController,
  listCategoriesController,
  updateCategoryController,
} from "./category.controller.js";
import {
  categoryIdParamsSchema,
  createCategoryBodySchema,
  updateCategoryBodySchema,
} from "./category.schema.js";
import type {
  CategoryParams,
  CreateCategoryInput,
  UpdateCategoryInput,
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

  // Atualizar uma categoria e seus tipos de ocorrência
  app.put<{ Params: CategoryParams; Body: UpdateCategoryInput }>(
    "/categorias/:id",
    {
      schema: {
        params: categoryIdParamsSchema,
        body: updateCategoryBodySchema,
      },
    },
    updateCategoryController,
  );

  // Inativar uma categoria e seus tipos de ocorrência
  app.delete<{ Params: CategoryParams }>(
    "/categorias/:id",
    {
      schema: {
        params: categoryIdParamsSchema,
      },
    },
    deactivateCategoryController,
  );
}
