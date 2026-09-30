import { createHash, randomBytes, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import {
    accessTokenTtl,
    jwtAccessSecret,
    refreshTokenTtlDays,
} from '../config.js';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function createAccessToken(userId) {
    return jwt.sign({}, jwtAccessSecret, {
        algorithm: 'HS256',
        subject: userId,
        jwtid: randomUUID(),
        expiresIn: accessTokenTtl,
    });
}

function verifyAccessToken(accessToken) {
    const payload = jwt.verify(accessToken, jwtAccessSecret, {
        algorithms: ['HS256'],
    });

    if (
        typeof payload !== 'object' ||
        typeof payload.sub !== 'string' ||
        typeof payload.jti !== 'string'
    ) {
        throw new jwt.JsonWebTokenError('Некорректная структура access-токена');
    }

    return payload;
}

function createRefreshToken() {
    return randomBytes(32).toString('base64url');
}

function hashRefreshToken(refreshToken) {
    return createHash('sha256').update(refreshToken).digest('hex');
}

function createRefreshExpiresAt(now = new Date()) {
    return new Date(now.getTime() + refreshTokenTtlDays * MILLISECONDS_PER_DAY);
}

export {
    createAccessToken,
    verifyAccessToken,
    createRefreshToken,
    hashRefreshToken,
    createRefreshExpiresAt,
};
