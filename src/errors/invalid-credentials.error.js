import { AppError } from './app.error.js';

class InvalidCredentialsError extends AppError {
    constructor(details = []) {
        super('Неверный email или пароль', 'INVALID_CREDENTIALS', details);
    }
}

export { InvalidCredentialsError };
