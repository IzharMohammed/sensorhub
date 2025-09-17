import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { buildJsonSchemas } from "fastify-zod";

// Zod schemas
export const telemetryPingInputSchema = z.object({
    deviceId: z.string().min(1, "Device ID is required"),
    eventId: z.string().min(1, "Event ID is required for idempotency"),
    metric: z.string().min(1, "Metric is required"),
    value: z.number(),
    status: z.enum(["ok", "warning", "critical"]),
    ts: z.string().datetime("Invalid timestamp format"),
});

export const telemetryPingGeneratedSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
});

export const createTelemetryPingSchema = telemetryPingInputSchema;
export const telemetryPingResponseSchema = telemetryPingInputSchema.merge(telemetryPingGeneratedSchema);

export const deviceStatusSchema = z.object({
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

export const deviceStatusResponseSchema = z.array(deviceStatusSchema);

export const errorResponseSchema = z.object({
    error: z.string(),
    message: z.string(),
    requestId: z.string(),
});

// Zod inferred types
export type CreateTelemetryPingInput = z.infer<typeof createTelemetryPingSchema>;

// JSON Schema exports
export const schemas = {
    createTelemetryPingSchema: zodToJsonSchema(createTelemetryPingSchema, "createTelemetryPingSchema"),
    telemetryPingResponseSchema: zodToJsonSchema(telemetryPingResponseSchema, "telemetryPingResponseSchema"),
    deviceStatusResponseSchema: zodToJsonSchema(deviceStatusResponseSchema, "deviceStatusResponseSchema"),
    errorResponseSchema: zodToJsonSchema(errorResponseSchema, "errorResponseSchema"),
};
