export const categoryIdParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: {
      type: "string",
      pattern: "^[1-9][0-9]*$",
    },
  },
} as const;

export const createCategoryBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "occurrenceTypes"],
  properties: {
    name: { type: "string", minLength: 1, maxLength: 120 },
    type: { type: "string", maxLength: 80 },
    description: { type: "string", maxLength: 500 },
    occurrenceTypes: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: {
        type: "string",
        minLength: 1,
        maxLength: 180,
      },
    },
  },
} as const;

export const updateCategoryBodySchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 120 },
    type: { type: "string", maxLength: 80 },
    description: { type: "string", maxLength: 500 },
    active: { type: "boolean" },
    occurrenceTypes: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: {
        type: "string",
        minLength: 1,
        maxLength: 180,
      },
    },
  },
} as const;

export function parseCategoryId(value: string) {
  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
