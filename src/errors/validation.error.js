import { AppError } from './app.error.js';

class ValidationError extends AppError {
    constructor(message, details = []) {
        super(message, 'VALIDATION_ERROR', details);
    }
}

export { ValidationError };
