// billing.schema.ts
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Input fields
const subscriptionInput = {
    deviceId: z.string().min(1, "Device ID is required"),
    planId: z.string().min(1, "Plan ID is required"),
};

// Auto-generated fields
const subscriptionGenerated = {
    id: z.string(),
    status: z.enum(["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"]),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    providerRef: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
};

// Zod schemas
export const createSubscriptionSchema = z.object({
    ...subscriptionInput,
});

export const subscriptionResponseSchema = z.object({
    ...subscriptionInput,
    ...subscriptionGenerated,
});

export const errorResponseSchema = z.object({
    error: z.string(),
    message: z.string(),
    requestId: z.string(),
});

// Inferred type
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

// JSON Schemas
export const schemas = {
    createSubscriptionSchema: zodToJsonSchema(createSubscriptionSchema, "createSubscriptionSchema"),
    subscriptionResponseSchema: zodToJsonSchema(subscriptionResponseSchema, "subscriptionResponseSchema"),
    errorResponseSchema: zodToJsonSchema(errorResponseSchema, "errorResponseSchema"),
};
