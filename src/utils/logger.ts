import pino from 'pino';
import { loggerConfig } from './logger-config';

export const logger = pino(loggerConfig);
export type Logger = typeof logger;