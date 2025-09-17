import { FastifyInstance } from "fastify";
import { $ref } from "./telemetry.schema";
import { createTelemetryPingHandler, getDevicesStatusHandler } from "./telemetry.controller";

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

    // GET /telemetry/devices/status
    server.get(
        "/devices/status",
        {
            schema: {
                response: {
                    200: $ref("deviceStatusResponseSchema"),
                },
            },
        },
        getDevicesStatusHandler
    );

}