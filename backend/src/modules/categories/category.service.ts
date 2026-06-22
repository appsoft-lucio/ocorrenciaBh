import {
  createCategory as createCategoryRepository,
  findCategoryById as findCategoryByIdRepository,
  findCategoryByName,
  listCategories as listCategoriesRepository,
} from "./category.repository.js";
import type { CreateCategoryInput } from "./category.types.js";

export class CategoryNotFoundError extends Error {
  constructor() {
    super("Categoria não encontrada.");
    this.name = "CategoryNotFoundError";
  }
}

export class CategoryNameAlreadyExistsError extends Error {
  constructor() {
    super("Já existe uma categoria cadastrada com esse nome.");
    this.name = "CategoryNameAlreadyExistsError";
  }
}

export class DuplicateOccurrenceTypesError extends Error {
  constructor() {
    super("A lista contém tipos de ocorrência repetidos.");
    this.name = "DuplicateOccurrenceTypesError";
  }
}

function optionalText(value?: string) {
  const normalized = value?.trim();
  return normalized || undefined;
}

// Listar todas as categorias
export async function listCategories() {
  return listCategoriesRepository();
}

// Buscar uma categoria pelo ID
export async function getCategoryById(id: number) {
  const category = await findCategoryByIdRepository(id);

  if (!category) {
    throw new CategoryNotFoundError();
  }

  return category;
}

// Inserir uma categoria e seus tipos de ocorrência
export async function createCategory(input: CreateCategoryInput) {
  const occurrenceTypes = input.occurrenceTypes
    .map((value) => value.trim())
    .filter(Boolean);
  const normalizedTypeNames = occurrenceTypes.map((value) =>
    value.toLocaleLowerCase("pt-BR"),
  );

  if (new Set(normalizedTypeNames).size !== occurrenceTypes.length) {
    throw new DuplicateOccurrenceTypesError();
  }

  const normalizedInput: CreateCategoryInput = {
    name: input.name.trim(),
    type: optionalText(input.type),
    description: optionalText(input.description),
    occurrenceTypes,
  };
  const existingCategory = await findCategoryByName(normalizedInput.name);

  if (existingCategory) {
    throw new CategoryNameAlreadyExistsError();
  }

  try {
    return await createCategoryRepository(normalizedInput);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("UK_CATEGORIAS_NOME")) {
      throw new CategoryNameAlreadyExistsError();
    }

    throw error;
  }
}
