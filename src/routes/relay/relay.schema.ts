import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Input schema
const relayPublishInput = {
    clientId: z.string().min(1, "Client ID is required"),
    message: z.string().min(1, "Message is required"),
    meta: z.record(z.any(), z.any()).optional(),
};

// Auto-generated fields
const relayLogGenerated = {
    id: z.string(),
    idempotencyKey: z.string(),
    status: z.enum(["PENDING", "SUCCESS", "FAILED", "RETRYING"]),
    attempts: z.number(),
    maxAttempts: z.number(),
    completedAt: z.string().nullable(),
    error: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
};

// Zod schemas
export const createRelayPublishSchema = z.object({
    ...relayPublishInput,
});

export const relayPublishResponseSchema = z.object({
    ...relayPublishInput,
    ...relayLogGenerated,
});

export const errorResponseSchema = z.object({
    error: z.string(),
    message: z.string(),
    requestId: z.string(),
});

// Type exports
export type CreateRelayPublishInput = z.infer<typeof createRelayPublishSchema>;

// JSON schemas
export const schemas = {
    createRelayPublishSchema: zodToJsonSchema(createRelayPublishSchema, "createRelayPublishSchema"),
    relayPublishResponseSchema: zodToJsonSchema(relayPublishResponseSchema, "relayPublishResponseSchema"),
    errorResponseSchema: zodToJsonSchema(errorResponseSchema, "errorResponseSchema"),
};
