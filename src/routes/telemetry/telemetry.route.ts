import { FastifyInstance } from "fastify";
import { schemas } from "./telemetry.schema";
import { createTelemetryPingHandler, getDevicesStatusHandler } from "./telemetry.controller";

export async function telemetryRoutes(server: FastifyInstance) {
    server.post(
        "/ping",
        {
            schema: {
                body: schemas.createTelemetryPingSchema,
                response: {
                    201: schemas.telemetryPingResponseSchema,
                    200: schemas.telemetryPingResponseSchema, // For idempotency
                    403: schemas.errorResponseSchema,
                    429: schemas.errorResponseSchema,
                },
            },
        },
        createTelemetryPingHandler
    );

    server.get(
        "/devices/status",
        {
            schema: {
                response: {
                    200: schemas.deviceStatusResponseSchema,
                },
            },
        },
        getDevicesStatusHandler
    );
}
