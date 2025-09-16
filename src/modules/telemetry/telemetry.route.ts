import { FastifyInstance } from "fastify";
import { registerTelemetryHandler } from "./telemetry.controller";

export async function telemetryRoutes(server: FastifyInstance) {
    server.post("/", registerTelemetryHandler)
}