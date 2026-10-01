import { rateLimit } from 'express-rate-limit';
import {
    loginRateLimitMax,
    loginRateLimitWindowMs,
    rateLimitMax,
    rateLimitWindowMs,
} from '../config.js';
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

const loginRateLimiter = rateLimit({
    windowMs: loginRateLimitWindowMs,
    limit: loginRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (_request, _response, next) => {
        return next(
            new RateLimitError(
                'Слишком много попыток входа, повторите попытку позже'
            )
        );
    },
});

export { apiRateLimiter, loginRateLimiter };
