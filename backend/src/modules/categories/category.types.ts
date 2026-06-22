export interface OccurrenceType {
  id: number;
  categoryId: number;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  type: string | null;
  description: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  occurrenceTypes: OccurrenceType[];
}

export interface CategoryParams {
  id: string;
}

export interface CreateCategoryInput {
  name: string;
  type?: string;
  description?: string;
  occurrenceTypes: string[];
}

export interface UpdateCategoryInput {
  name?: string;
  type?: string;
  description?: string;
  active?: boolean;
  occurrenceTypes?: string[];
}
