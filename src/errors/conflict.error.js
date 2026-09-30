import { AppError } from './app.error.js';

class ConflictError extends AppError {
    constructor(message, details = []) {
        super(message, 'CONFLICT', details);
    }
}

export { ConflictError };
