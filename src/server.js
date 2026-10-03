import process from 'node:process';
import { app } from './app.js';
import { port, shutdownTimeoutMs } from './config.js';
import { connectDatabase, disconnectDatabase } from './database/sequelize.js';
import { logger } from './logger.js';

let httpServer;
let isShutdown = false;

function startServer() {
    httpServer = app.listen(port, () => {
        logger.info(`HTTP server started on port: ${port}`);
    });

    httpServer.on('error', (error) => {
        logger.fatal(error, 'HTTP server failed');
        process.exitCode = 1;
    });

    void connectDatabase()
        .then(() => {
            logger.info('Database connection established');
        })
        .catch((error) => {
            logger.error(
                error,
                'Database connection failed; readiness is unavailable'
            );
        });
}

function closeHttpServer() {
    return new Promise((resolve, reject) => {
        if (!httpServer) {
            resolve();
            return;
        }

        httpServer.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });

        httpServer.closeIdleConnections?.();
    });
}

async function shutdown(signal) {
    if (isShutdown) {
        return;
    }
    isShutdown = true;
    logger.info({ signal }, 'Server shutdown started');

    const emergencyTimer = setTimeout(() => {
        logger.fatal(
            { signal, shutdownTimeoutMs },
            'Graceful shutdown timeout exceeded'
        );
        httpServer?.closeAllConnections?.();
        process.exit(1);
    }, shutdownTimeoutMs);

    emergencyTimer.unref();

    try {
        await closeHttpServer();
        await disconnectDatabase();
        clearTimeout(emergencyTimer);
        logger.info({ signal }, 'Server shutdown completed');
    } catch (error) {
        clearTimeout(emergencyTimer);
        httpServer?.closeAllConnections?.();
        logger.error(error, 'Server shutdown failed');
        process.exitCode = 1;
    }
}

startServer();

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
