import {
  findCategoryById as findCategoryByIdRepository,
  listCategories as listCategoriesRepository,
} from "./category.repository.js";

export class CategoryNotFoundError extends Error {
  constructor() {
    super("Categoria não encontrada.");
    this.name = "CategoryNotFoundError";
  }
}

export async function listCategories() {
  return listCategoriesRepository();
}

export async function getCategoryById(id: number) {
  const category = await findCategoryByIdRepository(id);

  if (!category) {
    throw new CategoryNotFoundError();
  }

  return category;
}
