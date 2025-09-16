import pino from 'pino';
import { config } from '../config';

export const logger = pino({
    level: config.logLevel,
    transport: config.nodeEnv === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    } : undefined,
    formatters: {
        level: (label) => ({ level: label }),
    },
    serializers: {
        err: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
    },
    base: {
        service: 'sensorhub-relay',
        version: process.env.npm_package_version || '1.0.0',
    },
});

export type Logger = typeof logger;