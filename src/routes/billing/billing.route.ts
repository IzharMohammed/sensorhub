import { FastifyInstance } from "fastify";
import { createSubscriptionHandler } from "./billing.controller";
import { $ref } from "./billing.schema";

async function billingRoutes(server: FastifyInstance) {
    // POST /billing/subscribe
    server.post(
        "/subscribe",
        {
            schema: {
                body: $ref("createSubscriptionSchema"),
                response: {
                    201: $ref("subscriptionResponseSchema"),
                    402: $ref("errorResponseSchema"),
                    502: $ref("errorResponseSchema"),
                },
            },
        },
        createSubscriptionHandler
    );
}

export default billingRoutes;