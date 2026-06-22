import type { FastifyReply, FastifyRequest } from "fastify";
import { parseCategoryId } from "./category.schema.js";
import {
  CategoryNotFoundError,
  getCategoryById,
  listCategories,
} from "./category.service.js";
import type { CategoryParams } from "./category.types.js";

// Listar todas as categorias
export async function listCategoriesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const categories = await listCategories();
    return { data: categories };
  } catch (error) {
    request.log.error(error, "Não foi possível consultar as categorias");

    return reply.status(503).send({
      error: "DATABASE_UNAVAILABLE",
      message: "Não foi possível consultar as categorias.",
    });
  }
}

// Buscar uma categoria pelo ID
export async function getCategoryByIdController(
  request: FastifyRequest<{ Params: CategoryParams }>,
  reply: FastifyReply,
) {
  const id = parseCategoryId(request.params.id);

  if (!id) {
    return reply.status(400).send({
      error: "INVALID_CATEGORY_ID",
      message: "O ID da categoria deve ser um número inteiro positivo.",
    });
  }

  try {
    const category = await getCategoryById(id);
    return { data: category };
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return reply.status(404).send({
        error: "CATEGORY_NOT_FOUND",
        message: error.message,
      });
    }

    request.log.error(error, "Não foi possível consultar a categoria");

    return reply.status(503).send({
      error: "DATABASE_UNAVAILABLE",
      message: "Não foi possível consultar a categoria.",
    });
  }
}
