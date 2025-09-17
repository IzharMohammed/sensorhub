import { FastifyReply, FastifyRequest } from "fastify";
import { CreateRelayPublishInput } from "./relay.schema";
import {
    authenticateClient,
    createRelayLog,
    getRelayLogByIdempotencyKey,
    processRelayMessage,
    generateIdempotencyKey,
} from "./relay.service";

export async function publishRelayMessageHandler(
    request: FastifyRequest<{
        Body: CreateRelayPublishInput;
    }>,
    reply: FastifyReply
) {
    const { clientId, message, meta } = request.body;

    // Get API key from header
    const apiKey = request.headers["x-api-key"] as string;
    if (!apiKey) {
        return reply.code(401).send({
            error: "Unauthorized",
            message: "API key required",
            requestId: request.id,
        });
    }

    request.log.info({ clientId }, "Processing relay message");

    try {
        // Authenticate client
        const client = await authenticateClient(apiKey);
        if (!client) {
            request.log.warn({ apiKey: apiKey.substring(0, 8) + "..." }, "Invalid API key");
            return reply.code(401).send({
                error: "Unauthorized",
                message: "Invalid API key",
                requestId: request.id,
            });
        }

        // Verify client ID matches
        if (client.id !== clientId) {
            request.log.warn({ clientId, actualClientId: client.id }, "Client ID mismatch");
            return reply.code(403).send({
                error: "Forbidden",
                message: "Client ID does not match API key",
                requestId: request.id,
            });
        }

        // Generate or get idempotency key
        const idempotencyKey = (request.headers["x-idempotency-key"] as string) || generateIdempotencyKey();

        // Check for existing message with same idempotency key
        const existingLog = await getRelayLogByIdempotencyKey(idempotencyKey);
        if (existingLog) {
            request.log.info({ idempotencyKey }, "Duplicate relay message detected");
            return reply.code(200).send({
                clientId: existingLog.clientId,
                message: existingLog.message,
                meta: existingLog.meta as Record<string, any>,
                id: existingLog.id,
                idempotencyKey: existingLog.idempotencyKey,
                status: existingLog.status,
                attempts: existingLog.attempts,
                maxAttempts: existingLog.maxAttempts,
                completedAt: existingLog.completedAt?.toISOString() || null,
                error: existingLog.error,
                createdAt: existingLog.createdAt.toISOString(),
                updatedAt: existingLog.updatedAt.toISOString(),
            });
        }

        // Create relay log
        const relayLog = await createRelayLog({
            clientId,
            message,
            meta,
            idempotencyKey,
        });

        request.log.info({ relayLogId: relayLog.id }, "Relay log created");

        // Process the message immediately (async)
        processRelayMessage(relayLog.id).catch((error: any) => {
            request.log.error(error, "Failed to process relay message");
        });

        return reply.code(201).send({
            clientId: relayLog.clientId,
            message: relayLog.message,
            meta: relayLog.meta as Record<string, any>,
            id: relayLog.id,
            idempotencyKey: relayLog.idempotencyKey,
            status: relayLog.status,
            attempts: relayLog.attempts,
            maxAttempts: relayLog.maxAttempts,
            completedAt: relayLog.completedAt?.toISOString() || null,
            error: relayLog.error,
            createdAt: relayLog.createdAt.toISOString(),
            updatedAt: relayLog.updatedAt.toISOString(),
        });
    } catch (error) {
        request.log.error(error, "Failed to publish relay message");
        throw error;
    }
}