import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { ConflictError } from '../errors/conflict.error.js';
import { NotFoundError } from '../errors/not-found.error.js';

function normalizeDatabaseError(error) {
    if (error instanceof UniqueConstraintError) {
        return new ConflictError(
            'Запись с такими уникальными данными уже существует'
        );
    }

    if (error instanceof ForeignKeyConstraintError) {
        if (error.reltype === 'child') {
            return new NotFoundError('Связанная запись не найдена');
        }

        return new ConflictError(
            'Запись нельзя удалить, пока существуют связанные данные'
        );
    }

    return error;
}

function getErrorStatus(error) {
    if (error.type === 'entity.parse.failed') {
        return 400;
    }

    if (error.type === 'entity.too.large') {
        return 413;
    }

    switch (error.code) {
        case 'NOT_FOUND':
            return 404;
        case 'CONFLICT':
            return 409;
        case 'VALIDATION_ERROR':
            return 422;
        case 'RATE_LIMIT_EXCEEDED':
            return 429;
        case 'EXTERNAL_SERVICE_ERROR':
            return 502;
        default:
            return 500;
    }
}

function errorHandler(error, request, response, _next) {
    const normalizedError = normalizeDatabaseError(error);
    const status = getErrorStatus(normalizedError);

    if (status === 400) {
        return response.status(400).json({
            error: {
                code: 'BAD_REQUEST',
                message: 'Некорректный JSON',
                details: [],
                requestId: request.id ?? null,
            },
        });
    }

    if (status === 413) {
        return response.status(413).json({
            error: {
                code: 'PAYLOAD_TOO_LARGE',
                message: 'Размер тела запроса превышает допустимый лимит',
                details: [],
                requestId: request.id ?? null,
            },
        });
    }

    if (status === 500) {
        return response.status(status).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Внутренняя ошибка сервера',
                details: [],
                requestId: request.id ?? null,
            },
        });
    }

    return response.status(status).json({
        error: {
            code: normalizedError.code,
            message: normalizedError.message,
            details: normalizedError.details ?? [],
            requestId: request.id ?? null,
        },
    });
}

function notFoundHandler(request, response, next) {
    return next(
        new NotFoundError(
            `Маршрут "${request.method} ${request.originalUrl}" не найден`
        )
    );
}

export {
    getErrorStatus,
    errorHandler,
    notFoundHandler,
    normalizeDatabaseError,
};
