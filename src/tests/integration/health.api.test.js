import request from 'supertest';
import { jest } from '@jest/globals';
import { app } from '../../app.js';
import { sequelize } from '../../database/sequelize.js';

afterEach(() => {
    jest.restoreAllMocks();
});

describe('health API', () => {
    test.each(['/api/health', '/api/health/live'])(
        'возвращает liveness процесса для %s без обращения к БД',
        async (path) => {
            const querySpy = jest.spyOn(sequelize, 'query');
            const response = await request(app).get(path);

            expect(response.status).toBe(200);
            expect(response.headers['x-request-id']).toBeDefined();
            expect(response.body).toEqual({
                data: {
                    status: 'ok',
                },
            });
            expect(querySpy).not.toHaveBeenCalled();
        }
    );

    test('возвращает readiness=200 при доступной БД', async () => {
        const querySpy = jest
            .spyOn(sequelize, 'query')
            .mockResolvedValueOnce([[], {}]);

        const response = await request(app).get('/api/health/ready');

        expect(querySpy).toHaveBeenCalledWith('SELECT 1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            data: {
                status: 'ready',
            },
        });
    });

    test('возвращает readiness=503 при недоступной БД', async () => {
        jest.spyOn(sequelize, 'query').mockRejectedValueOnce(
            new Error('Database is unavailable')
        );

        const response = await request(app).get('/api/health/ready');

        expect(response.status).toBe(503);
        expect(response.body.error).toMatchObject({
            code: 'SERVICE_UNAVAILABLE',
            message: 'База данных временно недоступна',
        });
        expect(response.body.error.requestId).toBeDefined();
    });
});
