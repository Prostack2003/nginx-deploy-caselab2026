import { InvalidCredentialsError } from '../errors/invalid-credentials.error.js';
import { sequelize } from '../database/sequelize.js';
import { UnauthorizedError } from '../errors/unauthorized.error.js';
import * as userRepository from '../repositories/user.repository.js';
import * as refreshSessionRepository from '../repositories/refresh-session.repository.js';
import { hashPassword, verifyPassword } from '../security/password.js';
import {
    createAccessToken,
    createRefreshExpiresAt,
    createRefreshToken,
    hashRefreshToken,
} from '../security/tokens.js';

function toPublicUser(user) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        technicianId: user.technicianId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

async function issueTokens(userId, { transaction } = {}) {
    const refreshToken = createRefreshToken();

    const session = await refreshSessionRepository.create(
        {
            userId,
            tokenHash: hashRefreshToken(refreshToken),
            expiresAt: createRefreshExpiresAt(),
        },
        {
            transaction,
        }
    );

    return {
        accessToken: createAccessToken(userId),
        refreshToken,
        sessionId: session.id,
    };
}

async function register({ email, password }) {
    const passwordHash = await hashPassword(password);

    return userRepository.createViewer({
        email,
        passwordHash,
    });
}

async function login({ email, password }) {
    const user = await userRepository.findByEmailWithPassword(email);

    if (user === null) {
        throw new InvalidCredentialsError();
    }

    const passwordIsValid = await verifyPassword(password, user.passwordHash);

    if (!passwordIsValid || !user.isActive) {
        throw new InvalidCredentialsError();
    }

    const { accessToken, refreshToken } = await issueTokens(user.id);

    return {
        user: toPublicUser(user),
        accessToken,
        refreshToken,
    };
}

async function refresh(refreshToken) {
    if (!refreshToken) {
        throw new UnauthorizedError('Недействительный refresh-токен');
    }

    const tokenHash = hashRefreshToken(refreshToken);

    return sequelize.transaction(async (transaction) => {
        const currentSession =
            await refreshSessionRepository.findActiveByTokenHash(tokenHash, {
                transaction,
                lock: true,
            });

        if (currentSession === null) {
            throw new UnauthorizedError('Недействительный refresh-токен');
        }

        const user = await userRepository.findById(currentSession.userId, {
            transaction,
        });

        if (user === null || !user.isActive) {
            throw new UnauthorizedError('Недействительный refresh-токен');
        }

        const replacement = await issueTokens(user.id, {
            transaction,
        });

        const revoked = await refreshSessionRepository.revokeAndReplace(
            currentSession.id,
            replacement.sessionId,
            {
                transaction,
            }
        );

        if (!revoked) {
            throw new UnauthorizedError('Недействительный refresh-токен');
        }

        return {
            accessToken: replacement.accessToken,
            refreshToken: replacement.refreshToken,
        };
    });
}

async function logout(refreshToken) {
    if (!refreshToken) {
        return;
    }

    await refreshSessionRepository.revokeByTokenHash(
        hashRefreshToken(refreshToken)
    );
}

export { register, login, refresh, logout };
