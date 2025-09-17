import { FastifyInstance } from "fastify";
import { schemas } from "./telemetry.schema";
import { createTelemetryPingHandler, getDevicesStatusHandler } from "./telemetry.controller";
import rateLimit from "@fastify/rate-limit";
import { config } from "../../utils/config";

export async function telemetryRoutes(server: FastifyInstance) {
    // Rate limit for telemetry endpoints
    await server.register(rateLimit, {
        max: config.telemetryRateLimit,
        timeWindow: "1 minute",
        keyGenerator: (request) => {
            // Rate limit per device for telemetry
            const body = request.body as any;
            return `telemetry:${body?.deviceId || request.ip}`;
        },
        errorResponseBuilder: (request, context) => {
            return {
                error: "Telemetry Rate Limit Exceeded",
                message: `Too many telemetry requests. Limit: ${context.max} per device per minute`,
                requestId: request.id,
            };
        },
    });

    server.post(
        "/ping",
        {
            schema: {
                // body: schemas.createTelemetryPingSchema,
                body: {
                    content: {
                        'application/json': {
                            schema: { type: "object" }
                        },
                        // Other content types will not be validated
                    }
                },
                // response: {
                //     201: schemas.telemetryPingResponseSchema,
                //     200: schemas.telemetryPingResponseSchema, // For idempotency
                //     403: schemas.errorResponseSchema,
                //     429: schemas.errorResponseSchema,
                // },
            },
        },
        createTelemetryPingHandler
    );

    server.get(
        "/devices/status",
        {
            // schema: {
            //     response: {
            //         200: {
            //             content: {
            //                 'application/json': {
            //                     schema: schemas.deviceStatusResponseSchema
            //                 }
            //             }
            //         }
            //     },
            // },
        },
        getDevicesStatusHandler
    );
}
