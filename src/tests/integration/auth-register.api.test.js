import request from 'supertest';
import { app } from '../../app.js';
import { User } from '../../database/models/index.js';
import {
    connectTestDatabase,
    disconnectTestDatabase,
    truncateTestDatabase,
} from '../helpers/database.js';

beforeAll(async () => {
    await connectTestDatabase();
});

beforeEach(async () => {
    await truncateTestDatabase();
});

afterAll(async () => {
    await disconnectTestDatabase();
});

describe('POST /api/auth/register', () => {
    test('регистрирует viewer и не возвращает хеш пароля', async () => {
        const response = await request(app).post('/api/auth/register').send({
            email: '  User@Example.COM ',
            password: 'StrongPassword123',
        });

        expect(response.status).toBe(201);
        expect(response.body.data).toMatchObject({
            email: 'user@example.com',
            role: 'viewer',
            technicianId: null,
            isActive: true,
        });
        expect(response.body.data).not.toHaveProperty('password');
        expect(response.body.data).not.toHaveProperty('passwordHash');

        const user = await User.scope('withPassword').findOne({
            where: {
                email: 'user@example.com',
            },
        });

        expect(user).not.toBeNull();
        expect(user.passwordHash).not.toBe('StrongPassword123');
        expect(user.passwordHash).toEqual(expect.any(String));
    });

    test('не позволяет назначить роль через публичную регистрацию', async () => {
        const response = await request(app).post('/api/auth/register').send({
            email: 'user@example.com',
            password: 'StrongPassword123',
            role: 'admin',
        });

        expect(response.status).toBe(422);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(await User.count()).toBe(0);
    });

    test('возвращает 409 при повторной регистрации email', async () => {
        const body = {
            email: 'user@example.com',
            password: 'StrongPassword123',
        };

        const firstResponse = await request(app)
            .post('/api/auth/register')
            .send(body);

        const secondResponse = await request(app)
            .post('/api/auth/register')
            .send(body);

        expect(firstResponse.status).toBe(201);
        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body.error.code).toBe('CONFLICT');
        expect(await User.count()).toBe(1);
    });
});
