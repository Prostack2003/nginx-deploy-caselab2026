import { AppError } from './app.error.js';

class ForbiddenError extends AppError {
    constructor(
        message = 'Недостаточно прав для выполнения операции',
        details = []
    ) {
        super(message, 'FORBIDDEN', details);
    }
}

export { ForbiddenError };
