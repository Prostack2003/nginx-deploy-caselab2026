import { AppError } from './app.error.js';

class RateLimitError extends AppError {
    constructor(message, details = []) {
        super(message, 'RATE_LIMIT_EXCEEDED', details);
    }
}

export { RateLimitError };
