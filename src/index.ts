import Fastify from "fastify";
import { config } from "./utils/config";
import { setupPlugins } from "./utils/plugins";
import { setupRoutes } from "./routes";
import { logger } from "./utils/logger";

async function buildServer() {
    const server = Fastify({
        logger: logger,
        genReqId: () => {
            return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        },
    });

    // Setup plugins
    await setupPlugins(server);

    // Setup routes
    await setupRoutes(server);

    // Global error handler
    server.setErrorHandler(async (error, request, reply) => {
        request.log.error(error, "Unhandled error");

        // Don't expose internal errors in production
        const isProduction = config.nodeEnv === "production";
        const message = isProduction ? "Internal Server Error" : error.message;

        return reply.status(500).send({
            error: "Internal Server Error",
            message,
            requestId: request.id,
        });
    });

    return server;
}

async function start() {
    try {
        const server = await buildServer();

        await server.listen({
            port: config.port,
            host: "0.0.0.0",
        });

        logger.info(`Server listening on port ${config.port}`);
    } catch (error) {
        logger.error(error, "Failed to start server");
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
    logger.info("Received SIGINT, shutting down gracefully");
    process.exit(0);
});

process.on("SIGTERM", async () => {
    logger.info("Received SIGTERM, shutting down gracefully");
    process.exit(0);
});

if (require.main === module) {
    start();
}

export { buildServer };