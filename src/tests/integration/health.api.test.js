import request from 'supertest';
import { app } from '../../app.js';

describe('GET /api/health', () => {
    test('возвращает состояние процесса через HTTP', async () => {
        const response = await request(app).get('/api/health');

        expect(response.status).toBe(200);
        expect(response.headers['x-request-id']).toBeDefined();
        expect(response.body).toEqual({
            data: {
                status: 'ok',
            },
        });
    });
});
