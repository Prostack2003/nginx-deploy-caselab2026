import { logger } from '../logger.js';

function requestLoggerMiddleware(request, response, next) {
    const startedAt = Date.now();
    response.on('finish', () => {
        const finishedAt = Date.now();
        const durationMs = finishedAt - startedAt;

        const logData = {
            requestId: request.id,
            method: request.method,
            path: request.originalUrl,
            statusCode: response.statusCode,
            durationMs,
        };

        if (logData.statusCode >= 500) {
            logger.error(logData, 'HTTP request completed');
            return;
        }

        if (logData.statusCode >= 400) {
            logger.warn(logData, 'HTTP request completed');
            return;
        }

        logger.info(logData, 'HTTP request completed.');
    });

    return next();
}

export { requestLoggerMiddleware };
