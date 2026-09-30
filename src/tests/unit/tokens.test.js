import jwt from 'jsonwebtoken';
import { jwtAccessSecret, refreshTokenTtlDays } from '../../config.js';
import {
    createAccessToken,
    verifyAccessToken,
    createRefreshToken,
    hashRefreshToken,
    createRefreshExpiresAt,
} from '../../security/tokens.js';

describe('access token', () => {
    const userId = '10000000-0000-4000-8000-000000000001';

    test('создаёт подписанный JWT с sub и jti', () => {
        const token = createAccessToken(userId);
        const payload = verifyAccessToken(token);

        expect(payload.sub).toBe(userId);
        expect(payload.jti).toEqual(expect.any(String));
        expect(payload.exp).toBeGreaterThan(payload.iat);
    });

    test('отклоняет JWT без обязательного jti', () => {
        const token = jwt.sign({}, jwtAccessSecret, {
            subject: userId,
            expiresIn: '15m',
        });

        expect(() => verifyAccessToken(token)).toThrow(
            'Некорректная структура access-токена'
        );
    });

    test('отклоняет токен с недействительной подписью', () => {
        const token = createAccessToken(userId);

        expect(() => verifyAccessToken(`${token}broken`)).toThrow();
    });
});

describe('refresh token', () => {
    test('создаёт уникальный непрозрачный токен', () => {
        const firstToken = createRefreshToken();
        const secondToken = createRefreshToken();

        expect(firstToken).not.toBe(secondToken);
        expect(Buffer.from(firstToken, 'base64url')).toHaveLength(32);
    });

    test('создаёт детерминированный SHA-256-хеш', () => {
        const token = 'refresh-token';
        const firstHash = hashRefreshToken(token);
        const secondHash = hashRefreshToken(token);

        expect(firstHash).toBe(secondHash);
        expect(firstHash).toMatch(/^[a-f0-9]{64}$/);
        expect(firstHash).not.toContain(token);
    });

    test('вычисляет срок действия refresh-токена', () => {
        const now = new Date('2026-09-30T12:00:00.000Z');
        const expiresAt = createRefreshExpiresAt(now);

        expect(expiresAt.getTime()).toBe(
            now.getTime() + refreshTokenTtlDays * 24 * 60 * 60 * 1000
        );
    });
});
