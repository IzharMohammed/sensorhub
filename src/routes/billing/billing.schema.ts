import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const subscriptionInput = {
    deviceId: z.string().min(1, "Device ID is required"),
    planId: z.string().min(1, "Plan ID is required"),
};

const subscriptionGenerated = {
    id: z.string(),
    status: z.enum(["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"]),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    providerRef: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
};

const createSubscriptionSchema = z.object({
    ...subscriptionInput,
});

const subscriptionResponseSchema = z.object({
    ...subscriptionInput,
    ...subscriptionGenerated,
});

const errorResponseSchema = z.object({
    error: z.string(),
    message: z.string(),
    requestId: z.string(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

const models = {
    createSubscriptionSchema,
    subscriptionResponseSchema,
    errorResponseSchema,
}

//@ts-expect-error
export const { schemas: billingSchemas, $ref } = buildJsonSchemas({ models }, {
    $id: "billing",
});