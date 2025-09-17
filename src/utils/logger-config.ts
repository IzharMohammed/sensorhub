import { config } from '../config';

export const loggerConfig = {
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
        level: (label: string) => ({ level: label }),
    },
    base: {
        service: 'sensorhub-relay',
        version: process.env.npm_package_version || '1.0.0',
    },
};
