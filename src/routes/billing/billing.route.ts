// billing.routes.ts
import { FastifyInstance } from "fastify";
import { createSubscriptionHandler } from "./billing.controller";
import { schemas } from "./billing.schema";

async function billingRoutes(server: FastifyInstance) {
    server.post(
        "/subscribe",
        {
            schema: {
                body: schemas.createSubscriptionSchema,
                response: {
                    201: schemas.subscriptionResponseSchema,
                    402: schemas.errorResponseSchema,
                    502: schemas.errorResponseSchema,
                },
            },
        },
        createSubscriptionHandler
    );
}

export default billingRoutes;
