import { rateLimit } from 'express-rate-limit';
import { rateLimitWindowMs, rateLimitMax } from '../config.js';
import { RateLimitError } from '../errors/rate-limit.error.js';

const apiRateLimiter = rateLimit({
    windowMs: rateLimitWindowMs,
    limit: rateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_request, _response, next) => {
        return next(
            new RateLimitError(
                'Слишком много запросов, повторите попытку позже'
            )
        );
    },
});

export { apiRateLimiter };
