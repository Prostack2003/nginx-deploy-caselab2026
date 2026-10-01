import request from 'supertest';
import { app } from '../../app.js';
import { refreshCookieName } from '../../config.js';
import {
    connectTestDatabase,
    disconnectTestDatabase,
    truncateTestDatabase,
} from '../helpers/database.js';

function extractRefreshCookie(response) {
    const setCookieHeaders = response.headers['set-cookie'] ?? [];

    const refreshCookie = setCookieHeaders.find((cookie) =>
        cookie.startsWith(`${refreshCookieName}=`)
    );

    expect(refreshCookie).toBeDefined();

    return refreshCookie.split(';')[0];
}

async function registerAndLogin() {
    const credentials = {
        email: 'user@example.com',
        password: 'StrongPassword123',
    };

    const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(credentials);

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(credentials);

    expect(loginResponse.status).toBe(200);

    return {
        accessToken: loginResponse.body.data.accessToken,
        refreshCookie: extractRefreshCookie(loginResponse),
    };
}

beforeAll(async () => {
    await connectTestDatabase();
});

beforeEach(async () => {
    await truncateTestDatabase();
});

afterAll(async () => {
    await disconnectTestDatabase();
});

describe('refresh session lifecycle', () => {
    test('ротирует токен, отклоняет старый и отзывает новый при logout', async () => {
        const loginResult = await registerAndLogin();

        const refreshResponse = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', loginResult.refreshCookie);

        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body.data.accessToken).toEqual(
            expect.any(String)
        );
        expect(refreshResponse.body.data.accessToken).not.toBe(
            loginResult.accessToken
        );

        const replacementCookie = extractRefreshCookie(refreshResponse);

        expect(replacementCookie).not.toBe(loginResult.refreshCookie);

        const reusedTokenResponse = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', loginResult.refreshCookie);

        expect(reusedTokenResponse.status).toBe(401);
        expect(reusedTokenResponse.body.error.code).toBe('UNAUTHORIZED');

        const logoutResponse = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', replacementCookie);

        expect(logoutResponse.status).toBe(204);

        const clearedCookie = logoutResponse.headers['set-cookie']?.find(
            (cookie) => cookie.startsWith(`${refreshCookieName}=`)
        );

        expect(clearedCookie).toBeDefined();
        expect(clearedCookie).toContain(`${refreshCookieName}=;`);

        const revokedTokenResponse = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', replacementCookie);

        expect(revokedTokenResponse.status).toBe(401);
        expect(revokedTokenResponse.body.error.code).toBe('UNAUTHORIZED');
    });

    test('возвращает 401 при refresh без cookie', async () => {
        const response = await request(app).post('/api/auth/refresh');

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    test('logout остаётся идемпотентным без cookie', async () => {
        const response = await request(app).post('/api/auth/logout');

        expect(response.status).toBe(204);
    });
});
