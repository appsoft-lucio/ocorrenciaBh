import {
  createCategory as createCategoryRepository,
  findCategoryById as findCategoryByIdRepository,
  findCategoryByName,
  listCategories as listCategoriesRepository,
  updateCategory as updateCategoryRepository,
} from "./category.repository.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.types.js";

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

function normalizeOccurrenceTypes(values: string[]) {
  const occurrenceTypes = values.map((value) => value.trim()).filter(Boolean);
  const normalizedNames = occurrenceTypes.map((value) =>
    value.toLocaleLowerCase("pt-BR"),
  );

  if (new Set(normalizedNames).size !== occurrenceTypes.length) {
    throw new DuplicateOccurrenceTypesError();
  }

  return occurrenceTypes;
}

// Atualizar uma categoria e seus tipos de ocorrência
export async function updateCategory(
  id: number,
  input: UpdateCategoryInput,
) {
  const currentCategory = await findCategoryByIdRepository(id);

  if (!currentCategory) {
    throw new CategoryNotFoundError();
  }

  const normalizedInput: UpdateCategoryInput = {
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.type !== undefined && { type: optionalText(input.type) }),
    ...(input.description !== undefined && {
      description: optionalText(input.description),
    }),
    ...(input.active !== undefined && { active: input.active }),
    ...(input.occurrenceTypes !== undefined && {
      occurrenceTypes: normalizeOccurrenceTypes(input.occurrenceTypes),
    }),
  };

  if (
    normalizedInput.name &&
    normalizedInput.name !== currentCategory.name
  ) {
    const categoryWithSameName = await findCategoryByName(
      normalizedInput.name,
    );

    if (categoryWithSameName && categoryWithSameName.id !== id) {
      throw new CategoryNameAlreadyExistsError();
    }
  }

  try {
    const category = await updateCategoryRepository(id, normalizedInput);

    if (!category) {
      throw new CategoryNotFoundError();
    }

    return category;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("UK_CATEGORIAS_NOME")) {
      throw new CategoryNameAlreadyExistsError();
    }

    throw error;
  }
}
