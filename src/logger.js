import pino from 'pino';
import { logLevel } from './config.js';

const logger = pino({
    level: logLevel,
});

export { logger };
