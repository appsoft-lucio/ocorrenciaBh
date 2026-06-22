import type { FastifyReply, FastifyRequest } from "fastify";
import { parseStoreId } from "./store.schema.js";
import {
  createStore,
  getStoreById,
  listStores,
  StoreCodeAlreadyExistsError,
  StoreNotFoundError,
  updateStore,
} from "./store.service.js";
import type {
  CreateStoreInput,
  StoreParams,
  UpdateStoreInput,
} from "./store.types.js";

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

export async function createStoreController(
  request: FastifyRequest<{ Body: CreateStoreInput }>,
  reply: FastifyReply,
) {
  try {
    const store = await createStore(request.body);
    return reply.status(201).send({ data: store });
  } catch (error) {
    if (error instanceof StoreCodeAlreadyExistsError) {
      return reply.status(409).send({
        error: "STORE_CODE_ALREADY_EXISTS",
        message: error.message,
      });
    }

    request.log.error(error, "Não foi possível cadastrar a loja no Firebird");

    return reply.status(503).send({
      error: "DATABASE_UNAVAILABLE",
      message: "Não foi possível cadastrar a loja.",
    });
  }
}

export async function updateStoreController(
  request: FastifyRequest<{
    Params: StoreParams;
    Body: UpdateStoreInput;
  }>,
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
    const store = await updateStore(id, request.body);
    return { data: store };
  } catch (error) {
    if (error instanceof StoreNotFoundError) {
      return reply.status(404).send({
        error: "STORE_NOT_FOUND",
        message: error.message,
      });
    }

    if (error instanceof StoreCodeAlreadyExistsError) {
      return reply.status(409).send({
        error: "STORE_CODE_ALREADY_EXISTS",
        message: error.message,
      });
    }

    request.log.error(error, "Não foi possível atualizar a loja no Firebird");

    return reply.status(503).send({
      error: "DATABASE_UNAVAILABLE",
      message: "Não foi possível atualizar a loja.",
    });
  }
}
