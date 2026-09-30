import { AppError } from './app.error.js';

class UnauthorizedError extends AppError {
    constructor(message = 'Требуется аутентификация', details = []) {
        super(message, 'UNAUTHORIZED', details);
    }
}

export { UnauthorizedError };
