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

export const createStoreBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["code", "name"],
  properties: {
    code: { type: "string", minLength: 1, maxLength: 20 },
    name: { type: "string", minLength: 1, maxLength: 120 },
    city: { type: "string", maxLength: 100 },
    address: { type: "string", maxLength: 250 },
    regional: { type: "string", maxLength: 100 },
    manager: { type: "string", maxLength: 120 },
    phone: { type: "string", maxLength: 30 },
    email: { type: "string", maxLength: 150 },
    openingHours: { type: "string", maxLength: 100 },
    status: { type: "string", enum: ["ATIVA", "INATIVA"] },
  },
} as const;

export function parseStoreId(value: string) {
  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
