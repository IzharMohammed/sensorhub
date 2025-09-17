import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables before parsing

export const configSchema = z.object({
    port: z.number().default(3000),
    nodeEnv: z.enum(["development", "production", "test"]).default("development"),
    databaseUrl: z.string(),
    redisUrl: z.string().default("redis://localhost:6379"),
    telemetryRateLimit: z.number().default(10),
    relayRateLimit: z.number().default(10),
    mockPaymentFailureRate: z.number().default(0.3),
    mockRelayFailureRate: z.number().default(0.2),
    logLevel: z.string().default("info"),
});

function loadConfig() {
    return configSchema.parse({
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL,
        redisUrl: process.env.REDIS_URL,
        telemetryRateLimit: process.env.TELEMETRY_RATE_LIMIT
            ? parseInt(process.env.TELEMETRY_RATE_LIMIT, 10)
            : undefined,
        relayRateLimit: process.env.RELAY_RATE_LIMIT
            ? parseInt(process.env.RELAY_RATE_LIMIT, 10)
            : undefined,
        mockPaymentFailureRate: process.env.MOCK_PAYMENT_FAILURE_RATE
            ? parseFloat(process.env.MOCK_PAYMENT_FAILURE_RATE)
            : undefined,
        mockRelayFailureRate: process.env.MOCK_RELAY_FAILURE_RATE
            ? parseFloat(process.env.MOCK_RELAY_FAILURE_RATE)
            : undefined,
        logLevel: process.env.LOG_LEVEL,
    });
}

export const config = loadConfig();