import { FastifyInstance } from "fastify";

export async function setupRoutes(server: FastifyInstance) {
    // API routes
    await server.register(telemetryRoutes, { prefix: "/telemetry" });
    await server.register(billingRoutes, { prefix: "/billing" });
    await server.register(relayRoutes, { prefix: "/relay" });

}