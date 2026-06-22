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

export function parseCategoryId(value: string) {
  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
