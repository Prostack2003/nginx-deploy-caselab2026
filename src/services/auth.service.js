import { InvalidCredentialsError } from '../errors/invalid-credentials.error.js';
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

    await refreshSessionRepository.create(
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

    const tokens = await issueTokens(user.id);

    return {
        user: toPublicUser(user),
        ...tokens,
    };
}

export { register, login };
