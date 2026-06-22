import type { FastifyReply, FastifyRequest } from "fastify";
import { parseStoreId } from "./store.schema.js";
import {
  getStoreById,
  listStores,
  StoreNotFoundError,
} from "./store.service.js";
import type { StoreParams } from "./store.types.js";

export async function listStoresController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const stores = await listStores();
    return { data: stores };
  } catch (error) {
    request.log.error(error, "Não foi possível consultar as lojas no Firebird");

    return reply.status(503).send({
      error: "DATABASE_UNAVAILABLE",
      message: "Não foi possível consultar as lojas.",
    });
  }
}

export async function getStoreByIdController(
  request: FastifyRequest<{ Params: StoreParams }>,
  reply: FastifyReply,
) {
  const id = parseStoreId(request.params.id);

  if (!id) {
    return reply.status(400).send({
      error: "INVALID_STORE_ID",
      message: "O ID da loja deve ser um número inteiro positivo.",
    });
  }

  try {
    const store = await getStoreById(id);
    return { data: store };
  } catch (error) {
    if (error instanceof StoreNotFoundError) {
      return reply.status(404).send({
        error: "STORE_NOT_FOUND",
        message: error.message,
      });
    }

    request.log.error(error, "Não foi possível consultar a loja no Firebird");

    return reply.status(503).send({
      error: "DATABASE_UNAVAILABLE",
      message: "Não foi possível consultar a loja.",
    });
  }
}
