import {
  createStore as createStoreRepository,
  findStoreByCode,
  findStoreById as findStoreByIdRepository,
  listStores as listStoresRepository,
} from "./store.repository.js";
import type { CreateStoreInput } from "./store.types.js";

export class StoreNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "StoreNotFoundError";
  }
}

export class StoreCodeAlreadyExistsError extends Error {
  constructor() {
    super("Já existe uma loja cadastrada com esse código.");
    this.name = "StoreCodeAlreadyExistsError";
  }
}

function optionalText(value?: string) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export async function listStores() {
  return listStoresRepository();
}

export async function getStoreById(id: number) {
  const store = await findStoreByIdRepository(id);

  if (!store) {
    throw new StoreNotFoundError();
  }

  return store;
}

export async function createStore(input: CreateStoreInput) {
  const normalizedInput: CreateStoreInput = {
    code: input.code.trim(),
    name: input.name.trim(),
    city: optionalText(input.city),
    address: optionalText(input.address),
    regional: optionalText(input.regional),
    manager: optionalText(input.manager),
    phone: optionalText(input.phone),
    email: optionalText(input.email)?.toLowerCase(),
    openingHours: optionalText(input.openingHours),
    status: input.status ?? "ATIVA",
  };

  const existingStore = await findStoreByCode(normalizedInput.code);

  if (existingStore) {
    throw new StoreCodeAlreadyExistsError();
  }

  try {
    return await createStoreRepository(normalizedInput);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("UK_LOJAS_CODIGO")) {
      throw new StoreCodeAlreadyExistsError();
    }

    throw error;
  }
}
