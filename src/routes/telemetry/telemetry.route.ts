import { FastifyInstance } from "fastify";
import { $ref } from "./telemetry.schema";
import { createTelemetryPingHandler } from "./telemetry.controller";

export async function telemetryRoutes(server: FastifyInstance) {

    // POST /telemetry/ping
    server.post(
        "/ping",
        {
            schema: {
                body: $ref("createTelemetryPingSchema"),
                response: {
                    201: $ref("telemetryPingResponseSchema"),
                    200: $ref("telemetryPingResponseSchema"), // For idempotent responses
                    403: $ref("errorResponseSchema"),
                    429: $ref("errorResponseSchema"),
                },
            },
        },
        createTelemetryPingHandler
    );

}