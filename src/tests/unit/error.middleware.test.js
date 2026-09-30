import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { normalizeDatabaseError } from '../../middlewares/error.middleware.js';
import { ConflictError } from '../../errors/conflict.error.js';
import { NotFoundError } from '../../errors/not-found.error.js';

describe('normalizeDatabaseError', () => {
    test('преобразует ошибку уникальности в ConflictError', () => {
        const databaseError = new UniqueConstraintError({});

        const normalizedError = normalizeDatabaseError(databaseError);

        expect(normalizedError).toBeInstanceOf(ConflictError);
        expect(normalizedError.code).toBe('CONFLICT');
    });

    test('преобразует отсутствующий внешний ключ в NotFoundError', () => {
        const databaseError = new ForeignKeyConstraintError({
            reltype: 'child',
        });

        const normalizedError = normalizeDatabaseError(databaseError);

        expect(normalizedError).toBeInstanceOf(NotFoundError);
        expect(normalizedError.code).toBe('NOT_FOUND');
    });

    test('преобразует используемый внешний ключ в ConflictError', () => {
        const databaseError = new ForeignKeyConstraintError({
            reltype: 'parent',
        });

        const normalizedError = normalizeDatabaseError(databaseError);

        expect(normalizedError).toBeInstanceOf(ConflictError);
        expect(normalizedError.code).toBe('CONFLICT');
    });
});
