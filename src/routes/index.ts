import { FastifyInstance } from "fastify";
import { telemetryRoutes } from "./telemetry/telemetry.route";

export async function setupRoutes(server: FastifyInstance) {
    // API routes
    await server.register(telemetryRoutes, { prefix: "/telemetry" });
    // await server.register(billingRoutes, { prefix: "/billing" });
    // await server.register(relayRoutes, { prefix: "/relay" });
}