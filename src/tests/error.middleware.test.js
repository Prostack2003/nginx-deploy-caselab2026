import test from 'node:test';
import assert from 'node:assert/strict';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { normalizeDatabaseError } from '../middlewares/error.middleware.js';
import { ConflictError } from '../errors/conflict.error.js';
import { NotFoundError } from '../errors/not-found.error.js';

test('преобразуем ошибку уникальности в ConflictError', () => {
    const databaseError = new UniqueConstraintError({});

    const normalizedError = normalizeDatabaseError(databaseError);

    assert.ok(normalizedError instanceof ConflictError);
    assert.equal(normalizedError.code, 'CONFLICT');
});

test('преобразуем отсутствующий внешний ключ в NotFoundError', () => {
    const databaseError = new ForeignKeyConstraintError({
        reltype: 'child',
    });

    const normalizedError = normalizeDatabaseError(databaseError);

    assert.ok(normalizedError instanceof NotFoundError);
    assert.equal(normalizedError.code, 'NOT_FOUND');
});

test('преобразуем используемый внешний ключ в ConflictError', () => {
    const databaseError = new ForeignKeyConstraintError({
        reltype: 'parent',
    });

    const normalizedError = normalizeDatabaseError(databaseError);

    assert.ok(normalizedError instanceof ConflictError);
    assert.equal(normalizedError.code, 'CONFLICT');
});
