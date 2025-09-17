import { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { publishRelayMessageHandler } from "./relay.controller";
import { schemas } from "./relay.schema";
import { config } from "../../utils/config";

async function relayRoutes(server: FastifyInstance) {
    // Rate limit for relay endpoints
    await server.register(rateLimit, {
        max: config.relayRateLimit,
        timeWindow: "1 minute",
        keyGenerator: (request) => {
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
                body: {
                    content: {
                        'application/json': {
                            schema: { type: "object" }
                        },
                        // Other content types will not be validated
                    }
                },
                // response: {
                //     201: schemas.relayPublishResponseSchema,
                //     200: schemas.relayPublishResponseSchema,
                //     401: schemas.errorResponseSchema,
                //     403: schemas.errorResponseSchema,
                //     429: schemas.errorResponseSchema,
                // },
            },
        },
        publishRelayMessageHandler
    );
}

export default relayRoutes;
