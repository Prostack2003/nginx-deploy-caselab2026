import express from 'express';
import { apiRouter } from './routes/index.js';
import {
    errorHandler,
    notFoundHandler,
} from './middlewares/error.middleware.js';
import { requestIdMiddleware } from './middlewares/request-id.middleware.js';
import { requestLoggerMiddleware } from './middlewares/request-logger.middleware.js';
import { jsonBodyLimit, corsOrigins } from './config.js';
import { apiRateLimiter } from './middlewares/rate-limit.middleware.js';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
const jsonMiddleware = express.json({
    limit: jsonBodyLimit,
});
const corsMiddleware = cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['X-Request-Id'],
});

app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(helmet());
app.use(corsMiddleware);
app.use('/api', apiRateLimiter);
app.use(jsonMiddleware);
app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
export { app };
