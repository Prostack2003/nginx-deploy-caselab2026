import { AppError } from './app.error.js';

class ServiceUnavailableError extends AppError {
    constructor(message, details = []) {
        super(message, 'SERVICE_UNAVAILABLE', details);
    }
}

export { ServiceUnavailableError };
