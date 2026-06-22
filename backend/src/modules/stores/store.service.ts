import {
  createStore as createStoreRepository,
  findStoreByCode,
  findStoreById as findStoreByIdRepository,
  listStores as listStoresRepository,
  updateStore as updateStoreRepository,
} from "./store.repository.js";
import type { CreateStoreInput, UpdateStoreInput } from "./store.types.js";

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

export async function updateStore(id: number, input: UpdateStoreInput) {
  const currentStore = await findStoreByIdRepository(id);

  if (!currentStore) {
    throw new StoreNotFoundError();
  }

  const normalizedInput: UpdateStoreInput = {
    ...(input.code !== undefined && { code: input.code.trim() }),
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.city !== undefined && { city: optionalText(input.city) }),
    ...(input.address !== undefined && { address: optionalText(input.address) }),
    ...(input.regional !== undefined && { regional: optionalText(input.regional) }),
    ...(input.manager !== undefined && { manager: optionalText(input.manager) }),
    ...(input.phone !== undefined && { phone: optionalText(input.phone) }),
    ...(input.email !== undefined && {
      email: optionalText(input.email)?.toLowerCase(),
    }),
    ...(input.openingHours !== undefined && {
      openingHours: optionalText(input.openingHours),
    }),
    ...(input.status !== undefined && { status: input.status }),
  };

  if (normalizedInput.code && normalizedInput.code !== currentStore.code) {
    const storeWithSameCode = await findStoreByCode(normalizedInput.code);

    if (storeWithSameCode && storeWithSameCode.id !== id) {
      throw new StoreCodeAlreadyExistsError();
    }
  }

  try {
    const store = await updateStoreRepository(id, normalizedInput);

    if (!store) {
      throw new StoreNotFoundError();
    }

    return store;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("UK_LOJAS_CODIGO")) {
      throw new StoreCodeAlreadyExistsError();
    }

    throw error;
  }
}
