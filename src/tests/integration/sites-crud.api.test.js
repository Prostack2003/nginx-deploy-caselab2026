import request from 'supertest';
import { app } from '../../app.js';
import { Equipment, Site, User } from '../../database/models/index.js';
import { createAccessToken } from '../../security/tokens.js';
import {
    connectTestDatabase,
    disconnectTestDatabase,
    truncateTestDatabase,
} from '../helpers/database.js';

function authorization(user) {
    return `Bearer ${createAccessToken(user.id)}`;
}

const sitePayload = {
    name: 'Тестовая площадка',
    code: 'test-site',
    region: 'Москва',
    location: {
        lat: 55.7558,
        lon: 37.6176,
    },
};

let admin;
let viewer;

beforeAll(async () => {
    await connectTestDatabase();
});

beforeEach(async () => {
    await truncateTestDatabase();

    admin = await User.create({
        email: 'admin-sites@example.com',
        passwordHash: 'not-used',
        role: 'admin',
        technicianId: null,
        isActive: true,
    });

    viewer = await User.create({
        email: 'viewer-sites@example.com',
        passwordHash: 'not-used',
        role: 'viewer',
        technicianId: null,
        isActive: true,
    });
});

afterAll(async () => {
    await disconnectTestDatabase();
});

describe('sites CRUD', () => {
    test('требует access-токен для получения списка площадок', async () => {
        const response = await request(app).get('/api/sites');

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    test('разрешает viewer чтение и запрещает создание площадки', async () => {
        const readResponse = await request(app)
            .get('/api/sites')
            .set('Authorization', authorization(viewer));

        expect(readResponse.status).toBe(200);
        expect(readResponse.body).toEqual({
            data: [],
            meta: {
                total: 0,
                page: 1,
                limit: 10,
            },
        });

        const createResponse = await request(app)
            .post('/api/sites')
            .set('Authorization', authorization(viewer))
            .send(sitePayload);

        expect(createResponse.status).toBe(403);
        expect(createResponse.body.error.code).toBe('FORBIDDEN');
    });

    test('позволяет admin выполнить полный CRUD площадки', async () => {
        const createResponse = await request(app)
            .post('/api/sites')
            .set('Authorization', authorization(admin))
            .send(sitePayload);

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.data).toMatchObject({
            name: sitePayload.name,
            code: 'TEST-SITE',
            region: sitePayload.region,
            location: sitePayload.location,
        });

        const siteId = createResponse.body.data.id;

        expect(createResponse.headers.location).toBe(`/api/sites/${siteId}`);

        const listResponse = await request(app)
            .get('/api/sites?page=1&limit=10&sortBy=code&order=desc')
            .set('Authorization', authorization(admin));

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.data).toHaveLength(1);
        expect(listResponse.body.data[0].id).toBe(siteId);
        expect(listResponse.body.meta).toEqual({
            total: 1,
            page: 1,
            limit: 10,
        });

        const getResponse = await request(app)
            .get(`/api/sites/${siteId}`)
            .set('Authorization', authorization(admin));

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.data.id).toBe(siteId);

        const updateResponse = await request(app)
            .patch(`/api/sites/${siteId}`)
            .set('Authorization', authorization(admin))
            .send({
                name: 'Обновлённая площадка',
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.data).toMatchObject({
            id: siteId,
            name: 'Обновлённая площадка',
            code: 'TEST-SITE',
        });

        const deleteResponse = await request(app)
            .delete(`/api/sites/${siteId}`)
            .set('Authorization', authorization(admin));

        expect(deleteResponse.status).toBe(204);

        const missingResponse = await request(app)
            .get(`/api/sites/${siteId}`)
            .set('Authorization', authorization(admin));

        expect(missingResponse.status).toBe(404);
        expect(missingResponse.body.error.code).toBe('NOT_FOUND');
    });

    test('возвращает 409 при повторяющемся коде площадки', async () => {
        await Site.create({
            name: 'Первая площадка',
            code: 'DUPLICATE-SITE',
            region: 'Москва',
            latitude: 55.7558,
            longitude: 37.6176,
        });

        const response = await request(app)
            .post('/api/sites')
            .set('Authorization', authorization(admin))
            .send({
                ...sitePayload,
                code: 'duplicate-site',
            });

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('CONFLICT');
    });

    test('возвращает 409 при удалении площадки с оборудованием', async () => {
        const site = await Site.create({
            name: 'Занятая площадка',
            code: 'BUSY-SITE',
            region: 'Москва',
            latitude: 55.7558,
            longitude: 37.6176,
        });

        await Equipment.create({
            siteId: site.id,
            name: 'Тестовая турбина',
            type: 'turbine',
            serialNumber: 'SITE-DELETE-TEST-001',
            status: 'operational',
            installedAt: '2025-01-01',
        });

        const response = await request(app)
            .delete(`/api/sites/${site.id}`)
            .set('Authorization', authorization(admin));

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('CONFLICT');
        expect(await Site.count({ where: { id: site.id } })).toBe(1);
    });
});
