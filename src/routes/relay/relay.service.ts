import { nanoid } from "nanoid";
import { CreateRelayPublishInput } from "./relay.schema";
import { callMockRelayProvider } from "../mock/mock.service";
import { logger } from "../../utils/logger";
import { prisma } from "../../utils/prisma";

export async function authenticateClient(apiKey: string) {
    return prisma.client.findUnique({
        where: {
            apiKey,
            isActive: true,
        },
    });
}

export async function createRelayLog(data: CreateRelayPublishInput & { idempotencyKey: string }) {
    const relayLog = await prisma.relayLog.create({
        data: {
            clientId: data.clientId,
            idempotencyKey: data.idempotencyKey,
            message: data.message,
            meta: data.meta || {},
            status: "PENDING",
            attempts: 0,
            maxAttempts: 3,
        },
    });

    return relayLog;
}

export async function getRelayLogByIdempotencyKey(idempotencyKey: string) {
    return prisma.relayLog.findUnique({
        where: { idempotencyKey },
    });
}

export async function processRelayMessage(relayLogId: string) {
    const relayLog = await prisma.relayLog.findUnique({
        where: { id: relayLogId },
    });

    if (!relayLog) {
        throw new Error("Relay log not found");
    }

    try {
        // Update status to indicate processing
        await prisma.relayLog.update({
            where: { id: relayLogId },
            data: {
                status: "RETRYING",
                attempts: relayLog.attempts + 1,
            },
        });

        // Call the mock relay provider
        const result = await callMockRelayProvider({
            idempotencyKey: relayLog.idempotencyKey,
            message: relayLog.message,
            meta: relayLog.meta as Record<string, any>,
        });

        if (result.success) {
            // Success - mark as completed
            await prisma.relayLog.update({
                where: { id: relayLogId },
                data: {
                    status: "SUCCESS",
                    completedAt: new Date(),
                    error: null,
                },
            });

            logger.info({ relayLogId }, "Relay message processed successfully");
            return { success: true };
        } else {
            // Failed - check if we should retry
            const shouldRetry = relayLog.attempts + 1 < relayLog.maxAttempts;

            if (shouldRetry) {
                // Calculate next retry time with exponential backoff
                const backoffDelay = Math.pow(2, relayLog.attempts) * 1000; // 1s, 2s, 4s
                const nextRetryAt = new Date(Date.now() + backoffDelay);

                await prisma.relayLog.update({
                    where: { id: relayLogId },
                    data: {
                        status: "PENDING",
                        nextRetryAt,
                        error: result.error,
                    },
                });

                logger.warn(
                    { relayLogId, attempt: relayLog.attempts + 1, nextRetryAt },
                    "Relay message failed, scheduled for retry"
                );

                return { success: false, willRetry: true, nextRetryAt };
            } else {
                // Max attempts reached - mark as failed
                await prisma.relayLog.update({
                    where: { id: relayLogId },
                    data: {
                        status: "FAILED",
                        error: result.error,
                    },
                });

                logger.error(
                    { relayLogId, attempts: relayLog.attempts + 1 },
                    "Relay message failed permanently"
                );

                return { success: false, willRetry: false };
            }
        }
    } catch (error) {
        // Unexpected error - mark for retry or failure
        const shouldRetry = relayLog.attempts + 1 < relayLog.maxAttempts;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (shouldRetry) {
            const backoffDelay = Math.pow(2, relayLog.attempts) * 1000;
            const nextRetryAt = new Date(Date.now() + backoffDelay);

            await prisma.relayLog.update({
                where: { id: relayLogId },
                data: {
                    status: "PENDING",
                    nextRetryAt,
                    error: errorMessage,
                },
            });
        } else {
            await prisma.relayLog.update({
                where: { id: relayLogId },
                data: {
                    status: "FAILED",
                    error: errorMessage,
                },
            });
        }

        throw error;
    }
}

export async function getPendingRetries() {
    const now = new Date();

    return prisma.relayLog.findMany({
        where: {
            status: "PENDING",
            nextRetryAt: { lte: now },
            attempts: { lt: prisma.relayLog.fields.maxAttempts },
        },
        orderBy: { nextRetryAt: "asc" },
        take: 100, // Process in batches
    });
}

export function generateIdempotencyKey(): string {
    return nanoid();
}