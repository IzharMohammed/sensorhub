import { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { publishRelayMessageHandler } from "./relay.controller";
import { $ref } from "./relay.schema";
import { config } from "../../utils/config";

async function relayRoutes(server: FastifyInstance) {
    // Rate limit for relay endpoints
    await server.register(rateLimit, {
        max: config.relayRateLimit,
        timeWindow: "1 minute",
        keyGenerator: (request) => {
            // Rate limit per client for relay
            const apiKey = request.headers["x-api-key"] as string;
            return `relay:${apiKey || request.ip}`;
        },
        errorResponseBuilder: (request, context) => {
            return {
                error: "Relay Rate Limit Exceeded",
                message: `Too many relay requests. Limit: ${context.max}`,
                requestId: request.id,
            };
        },
    });

    // POST /relay/publish
    server.post(
        "/publish",
        {
            schema: {
                body: $ref("createRelayPublishSchema"),
                response: {
                    201: $ref("relayPublishResponseSchema"),
                    200: $ref("relayPublishResponseSchema"), // For idempotent responses
                    401: $ref("errorResponseSchema"),
                    403: $ref("errorResponseSchema"),
                    429: $ref("errorResponseSchema"),
                },
            },
        },
        publishRelayMessageHandler
    );
}

export default relayRoutes;