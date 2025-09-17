import { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import redis from "@fastify/redis";
import { config } from "./config";

export async function setupPlugins(server: FastifyInstance) {
    // Security
    await server.register(helmet, {
        global: true,
    });

    // CORS
    await server.register(cors, {
        origin: true,
        credentials: true,
    });

    // Redis for rate limiting and caching
    await server.register(redis, {
        url: config.redisUrl,
        family: 4,
    });

    // Global rate limiting
    await server.register(rateLimit, {
        max: 1000, // 1000 requests per minute globally
        timeWindow: "1 minute",
        redis: server.redis,
        errorResponseBuilder: (request, context) => {
            return {
                error: "Rate limit exceeded",
                message: `Too many requests. Limit: ${context.max} per ${context.after}`,
                requestId: request.id,
            };
        },
    });

    // Health check plugin
    server.get("/health", async () => {
        return { status: "ok", timestamp: new Date().toISOString() };
    });

    // Ready check plugin (includes redis connectivity)
    server.get("/ready", async () => {
        try {

            // Check Redis
            await server.redis.ping();

            return {
                status: "ready",
                timestamp: new Date().toISOString(),
                services: {
                    database: "ok",
                    redis: "ok"
                }
            };
        } catch (error) {
            server.log.error(error, "Ready check failed");
            throw new Error("Service not ready");
        }
    });
}