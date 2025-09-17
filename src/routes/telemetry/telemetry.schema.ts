import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

// Define base input schema as a ZodObject
const telemetryPingInputSchema = z.object({
    deviceId: z.string().min(1, "Device ID is required"),
    eventId: z.string().min(1, "Event ID is required for idempotency"),
    metric: z.string().min(1, "Metric is required"),
    value: z.number(),
    status: z.enum(["ok", "warning", "critical"]),
    ts: z.string().datetime("Invalid timestamp format"),
});

// Define generated fields schema
const telemetryPingGeneratedSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
});

// Full create schema (same as input)
const createTelemetryPingSchema = telemetryPingInputSchema;

// Response includes both input and generated fields
const telemetryPingResponseSchema = telemetryPingInputSchema.merge(telemetryPingGeneratedSchema);

// Device status schema
const deviceStatusSchema = z.object({
    deviceId: z.string(),
    isActive: z.boolean(),
    lastSeenAt: z.string().nullable(),
    latestMetrics: z.array(z.object({
        metric: z.string(),
        value: z.number(),
        status: z.string(),
        ts: z.string(),
    })),
});

const deviceStatusResponseSchema = z.array(deviceStatusSchema);

// Error schema
const errorResponseSchema = z.object({
    error: z.string(),
    message: z.string(),
    requestId: z.string(),
});

// Type export
export type CreateTelemetryPingInput = z.infer<typeof createTelemetryPingSchema>;

const models = {
    createTelemetryPingSchema,
    telemetryPingResponseSchema,
    deviceStatusResponseSchema,
    errorResponseSchema,
}

export const { schemas: telemetrySchemas, $ref } = buildJsonSchemas({ models });