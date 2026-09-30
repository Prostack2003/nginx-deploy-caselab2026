import process from 'node:process';
import { app } from './app.js';
import { port } from './config.js';
import { connectDatabase, disconnectDatabase } from './database/sequelize.js';
import { logger } from './logger.js';

let httpServer;
let isShutdown = false;

async function startServer() {
    try {
        await connectDatabase();

        httpServer = app.listen(port, () => {
            logger.info(`HTTP server started on port: ${port}`);
        });
    } catch (error) {
        logger.fatal(error);
        process.exitCode = 1;
    }
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
    });
}

async function shutdown(signal) {
    if (isShutdown) {
        return;
    }
    isShutdown = true;
    logger.info(`Shutdown server shutdown: ${signal}`);
    try {
        await closeHttpServer();
        await disconnectDatabase();
        logger.info(`Server is closed`);
    } catch (error) {
        logger.error(error);
        process.exitCode = 1;
    }
}

await startServer();

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
