import {
  findStoreById as findStoreByIdRepository,
  listStores as listStoresRepository,
} from "./store.repository.js";

export class StoreNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "StoreNotFoundError";
  }
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
