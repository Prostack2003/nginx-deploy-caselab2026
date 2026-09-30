import { AppError } from './app.error.js';

class ExternalServiceError extends AppError {
    constructor(message, details = []) {
        super(message, 'EXTERNAL_SERVICE_ERROR', details);
    }
}

export { ExternalServiceError };
