import { FastifyInstance } from "fastify";
import { telemetryRoutes } from "./telemetry/telemetry.route";
import billingRoutes from "./billing/billing.route";
import relayRoutes from "./relay/relay.route";

export async function setupRoutes(server: FastifyInstance) {
    // API routes
    await server.register(telemetryRoutes, { prefix: "/telemetry" });
    await server.register(billingRoutes, { prefix: "/billing" });
    await server.register(relayRoutes, { prefix: "/relay" });
}