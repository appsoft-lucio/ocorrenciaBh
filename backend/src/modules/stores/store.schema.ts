export const storeIdParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: {
      type: "string",
      pattern: "^[1-9][0-9]*$",
    },
  },
} as const;

export function parseStoreId(value: string) {
  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
