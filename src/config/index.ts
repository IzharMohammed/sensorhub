import { z } from 'zod';

const configSchema = z.object({
    port: z.number().default(3000),
    nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
    logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),

    database: z.object({
        url: z.string(),
    }),

    redis: z.object({
        url: z.string(),
    }),

    rateLimits: z.object({
        telemetry: z.number().default(100),
        publish: z.number().default(50),
        window: z.number().default(60000), // 1 minute
    }),

    retry: z.object({
        maxAttempts: z.number().default(3),
        delayMs: z.number().default(1000),
        backoffFactor: z.number().default(2),
    }),

    mock: z.object({
        payFailRate: z.number().min(0).max(1).default(0.3),
        relayFailRate: z.number().min(0).max(1).default(0.2),
    }),
});

export type Config = z.infer<typeof configSchema>;

export const config: Config = configSchema.parse({
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',

    database: {
        url: process.env.DATABASE_URL!,
    },

    redis: {
        url: process.env.REDIS_URL!,
    },

    rateLimits: {
        telemetry: parseInt(process.env.TELEMETRY_RATE_LIMIT || '100'),
        publish: parseInt(process.env.PUBLISH_RATE_LIMIT || '50'),
        window: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
    },

    retry: {
        maxAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
        delayMs: parseInt(process.env.RETRY_DELAY_MS || '1000'),
        backoffFactor: parseInt(process.env.RETRY_BACKOFF_FACTOR || '2'),
    },

    mock: {
        payFailRate: parseFloat(process.env.MOCK_PAY_FAIL_RATE || '0.3'),
        relayFailRate: parseFloat(process.env.MOCK_RELAY_FAIL_RATE || '0.2'),
    },
});