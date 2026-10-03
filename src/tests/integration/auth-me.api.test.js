import request from 'supertest';
import { app } from '../../app.js';
import { User } from '../../database/models/index.js';
import {
    connectTestDatabase,
    disconnectTestDatabase,
    truncateTestDatabase,
} from '../helpers/database.js';

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
        user: registerResponse.body.data,
        accessToken: loginResponse.body.data.accessToken,
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

describe('GET /api/auth/me', () => {
    test('возвращает актуального пользователя по Bearer JWT', async () => {
        const { user, accessToken } = await registerAndLogin();

        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            id: user.id,
            email: 'user@example.com',
            role: 'viewer',
            isActive: true,
        });
        expect(response.body.data).not.toHaveProperty('password');
        expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    test('возвращает 401 без Authorization', async () => {
        const response = await request(app).get('/api/auth/me');

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    test('возвращает 401 для повреждённого JWT', async () => {
        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    test('сразу блокирует отключённого пользователя', async () => {
        const { user, accessToken } = await registerAndLogin();

        await User.update(
            {
                isActive: false,
            },
            {
                where: {
                    id: user.id,
                },
            }
        );

        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
});
