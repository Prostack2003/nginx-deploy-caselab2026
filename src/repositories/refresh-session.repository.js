import { Op } from 'sequelize';
import { RefreshSession } from '../database/models/index.js';

function toPublicSession(session) {
    return {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt,
        replacedBySessionId: session.replacedBySessionId,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    };
}

async function create({ userId, tokenHash, expiresAt }, { transaction } = {}) {
    const session = await RefreshSession.create(
        {
            userId,
            tokenHash,
            expiresAt,
        },
        {
            transaction,
        }
    );

    return toPublicSession(session);
}

async function findActiveByTokenHash(
    tokenHash,
    { transaction, lock = false, now = new Date() } = {}
) {
    const options = {
        where: {
            tokenHash,
            revokedAt: null,
            expiresAt: {
                [Op.gt]: now,
            },
        },
        transaction,
    };

    if (lock && transaction) {
        options.lock = transaction.LOCK.UPDATE;
    }

    const session = await RefreshSession.findOne(options);

    return session === null ? null : toPublicSession(session);
}

async function revokeAndReplace(
    sessionId,
    replacementSessionId,
    { transaction, revokedAt = new Date() } = {}
) {
    const [updatedCount] = await RefreshSession.update(
        {
            revokedAt,
            replacedBySessionId: replacementSessionId,
        },
        {
            where: {
                id: sessionId,
                revokedAt: null,
            },
            transaction,
        }
    );

    return updatedCount === 1;
}

async function revokeByTokenHash(
    tokenHash,
    { transaction, revokedAt = new Date() } = {}
) {
    const [updatedCount] = await RefreshSession.update(
        {
            revokedAt,
        },
        {
            where: {
                tokenHash,
                revokedAt: null,
            },
            transaction,
        }
    );

    return updatedCount > 0;
}

export { create, findActiveByTokenHash, revokeAndReplace, revokeByTokenHash };
