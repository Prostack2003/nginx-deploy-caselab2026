import { AppError } from './app.error.js';

class NotFoundError extends AppError {
    constructor(message, details = []) {
        super(message, 'NOT_FOUND', details);
    }
}

export { NotFoundError };
