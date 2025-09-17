import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const relayPublishInput = {
    clientId: z.string().min(1, "Client ID is required"),
    message: z.string().min(1, "Message is required"),
    meta: z.record(z.any(), z.any()).optional(),
};

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

const createRelayPublishSchema = z.object({
    ...relayPublishInput,
});

const relayPublishResponseSchema = z.object({
    ...relayPublishInput,
    ...relayLogGenerated,
});

const errorResponseSchema = z.object({
    error: z.string(),
    message: z.string(),
    requestId: z.string(),
});

export type CreateRelayPublishInput = z.infer<typeof createRelayPublishSchema>;

const models = {
    createRelayPublishSchema,
    relayPublishResponseSchema,
    errorResponseSchema,
}

//@ts-expect-error
export const { schemas: relaySchemas, $ref } = buildJsonSchemas({ models }, {
    $id: "relay",
});