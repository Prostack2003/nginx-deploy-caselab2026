import request from 'supertest';
import { app } from '../../app.js';
import {
    loginRateLimitMax,
    refreshCookieName,
    refreshTokenTtlDays,
} from '../../config.js';
import { RefreshSession } from '../../database/models/index.js';
import { loginRateLimiter } from '../../middlewares/rate-limit.middleware.js';
import { hashRefreshToken, verifyAccessToken } from '../../security/tokens.js';
import {
    connectTestDatabase,
    disconnectTestDatabase,
    truncateTestDatabase,
} from '../helpers/database.js';

const TEST_IP_KEY = '127.0.0.1';

async function registerUser() {
    const response = await request(app).post('/api/auth/register').send({
        email: 'user@example.com',
        password: 'StrongPassword123',
    });

    expect(response.status).toBe(201);

    return response.body.data;
}

beforeAll(async () => {
    await connectTestDatabase();
});

beforeEach(async () => {
    await truncateTestDatabase();
    await loginRateLimiter.resetKey(TEST_IP_KEY);
});

afterAll(async () => {
    await loginRateLimiter.resetKey(TEST_IP_KEY);
    await disconnectTestDatabase();
});

describe('POST /api/auth/login', () => {
    test('возвращает access-токен и устанавливает refresh-cookie', async () => {
        const user = await registerUser();

        const response = await request(app).post('/api/auth/login').send({
            email: 'USER@EXAMPLE.COM',
            password: 'StrongPassword123',
        });

        expect(response.status).toBe(200);
        expect(response.body.data.user).toMatchObject({
            id: user.id,
            email: 'user@example.com',
            role: 'viewer',
            isActive: true,
        });
        expect(response.body.data.user).not.toHaveProperty('passwordHash');
        expect(response.body.data.accessToken).toEqual(expect.any(String));
        expect(response.body.data).not.toHaveProperty('refreshToken');

        const accessPayload = verifyAccessToken(response.body.data.accessToken);

        expect(accessPayload.sub).toBe(user.id);

        const setCookieHeaders = response.headers['set-cookie'];
        expect(setCookieHeaders).toBeDefined();

        const refreshCookie = setCookieHeaders.find((cookie) =>
            cookie.startsWith(`${refreshCookieName}=`)
        );

        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toContain('HttpOnly');
        expect(refreshCookie).toContain('Secure');
        expect(refreshCookie).toContain('SameSite=Strict');
        expect(refreshCookie).toContain('Path=/api/auth');
        expect(refreshCookie).toContain(
            `Max-Age=${refreshTokenTtlDays * 24 * 60 * 60}`
        );

        const refreshToken = refreshCookie
            .split(';')[0]
            .slice(`${refreshCookieName}=`.length);

        const session = await RefreshSession.unscoped().findOne({
            where: {
                userId: user.id,
            },
        });

        expect(session).not.toBeNull();
        expect(session.tokenHash).toBe(hashRefreshToken(refreshToken));
        expect(session.tokenHash).not.toBe(refreshToken);
    });

    test('возвращает одинаковую ошибку для неизвестного email и неверного пароля', async () => {
        await registerUser();

        const unknownEmailResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'missing@example.com',
                password: 'StrongPassword123',
            });

        const wrongPasswordResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'user@example.com',
                password: 'WrongPassword123',
            });

        expect(unknownEmailResponse.status).toBe(401);
        expect(wrongPasswordResponse.status).toBe(401);

        expect({
            code: unknownEmailResponse.body.error.code,
            message: unknownEmailResponse.body.error.message,
        }).toEqual({
            code: 'INVALID_CREDENTIALS',
            message: 'Неверный email или пароль',
        });

        expect({
            code: wrongPasswordResponse.body.error.code,
            message: wrongPasswordResponse.body.error.message,
        }).toEqual({
            code: unknownEmailResponse.body.error.code,
            message: unknownEmailResponse.body.error.message,
        });
    });

    test('ограничивает количество неуспешных попыток входа', async () => {
        for (let attempt = 0; attempt < loginRateLimitMax; attempt += 1) {
            const response = await request(app).post('/api/auth/login').send({
                email: 'missing@example.com',
                password: 'WrongPassword123',
            });

            expect(response.status).toBe(401);
        }

        const blockedResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'missing@example.com',
                password: 'WrongPassword123',
            });

        expect(blockedResponse.status).toBe(429);
        expect(blockedResponse.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(blockedResponse.headers['retry-after']).toBeDefined();
    });
});
