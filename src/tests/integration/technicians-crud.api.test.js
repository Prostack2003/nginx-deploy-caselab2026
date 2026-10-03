import request from 'supertest';
import { app } from '../../app.js';
import {
    Equipment,
    MaintenanceRequest,
    RequestAssignee,
    Site,
    Technician,
    User,
} from '../../database/models/index.js';
import { createAccessToken } from '../../security/tokens.js';
import {
    connectTestDatabase,
    disconnectTestDatabase,
    truncateTestDatabase,
} from '../helpers/database.js';

function authorization(user) {
    return `Bearer ${createAccessToken(user.id)}`;
}

const technicianPayload = {
    fullName: 'Иван Петров',
    specialization: 'Обслуживание турбин',
    employeeNumber: 'tech-001',
};

let admin;
let viewer;

beforeAll(async () => {
    await connectTestDatabase();
});

beforeEach(async () => {
    await truncateTestDatabase();

    admin = await User.create({
        email: 'admin-technicians@example.com',
        passwordHash: 'not-used',
        role: 'admin',
        technicianId: null,
        isActive: true,
    });

    viewer = await User.create({
        email: 'viewer-technicians@example.com',
        passwordHash: 'not-used',
        role: 'viewer',
        technicianId: null,
        isActive: true,
    });
});

afterAll(async () => {
    await disconnectTestDatabase();
});

describe('technicians CRUD', () => {
    test('требует access-токен для получения списка специалистов', async () => {
        const response = await request(app).get('/api/technicians');

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    test('разрешает viewer чтение и запрещает создание специалиста', async () => {
        const readResponse = await request(app)
            .get('/api/technicians')
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
            .post('/api/technicians')
            .set('Authorization', authorization(viewer))
            .send(technicianPayload);

        expect(createResponse.status).toBe(403);
        expect(createResponse.body.error.code).toBe('FORBIDDEN');
    });

    test('позволяет admin выполнить полный CRUD специалиста', async () => {
        const createResponse = await request(app)
            .post('/api/technicians')
            .set('Authorization', authorization(admin))
            .send(technicianPayload);

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.data).toMatchObject({
            fullName: technicianPayload.fullName,
            specialization: technicianPayload.specialization,
            employeeNumber: 'TECH-001',
        });

        const technicianId = createResponse.body.data.id;

        expect(createResponse.headers.location).toBe(
            `/api/technicians/${technicianId}`
        );

        const listResponse = await request(app)
            .get(
                '/api/technicians?page=1&limit=10&sortBy=employeeNumber&order=desc'
            )
            .set('Authorization', authorization(admin));

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.data).toHaveLength(1);
        expect(listResponse.body.data[0].id).toBe(technicianId);
        expect(listResponse.body.meta).toEqual({
            total: 1,
            page: 1,
            limit: 10,
        });

        const getResponse = await request(app)
            .get(`/api/technicians/${technicianId}`)
            .set('Authorization', authorization(admin));

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.data.id).toBe(technicianId);

        const updateResponse = await request(app)
            .patch(`/api/technicians/${technicianId}`)
            .set('Authorization', authorization(admin))
            .send({
                specialization: 'Диагностика турбин',
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.data).toMatchObject({
            id: technicianId,
            specialization: 'Диагностика турбин',
            employeeNumber: 'TECH-001',
        });

        const deleteResponse = await request(app)
            .delete(`/api/technicians/${technicianId}`)
            .set('Authorization', authorization(admin));

        expect(deleteResponse.status).toBe(204);

        const missingResponse = await request(app)
            .get(`/api/technicians/${technicianId}`)
            .set('Authorization', authorization(admin));

        expect(missingResponse.status).toBe(404);
        expect(missingResponse.body.error.code).toBe('NOT_FOUND');
    });

    test('возвращает 409 при повторяющемся табельном номере', async () => {
        await Technician.create({
            fullName: 'Первый специалист',
            specialization: 'Электрика',
            employeeNumber: 'DUPLICATE-TECH',
        });

        const response = await request(app)
            .post('/api/technicians')
            .set('Authorization', authorization(admin))
            .send({
                ...technicianPayload,
                employeeNumber: 'duplicate-tech',
            });

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('CONFLICT');
    });

    test('возвращает 409 при удалении специалиста, связанного с пользователем', async () => {
        const technician = await Technician.create({
            fullName: 'Специалист с пользователем',
            specialization: 'Электрика',
            employeeNumber: 'LINKED-USER-TECH',
        });

        await User.create({
            email: 'linked-technician@example.com',
            passwordHash: 'not-used',
            role: 'technician',
            technicianId: technician.id,
            isActive: true,
        });

        const response = await request(app)
            .delete(`/api/technicians/${technician.id}`)
            .set('Authorization', authorization(admin));

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('CONFLICT');
        expect(await Technician.count({ where: { id: technician.id } })).toBe(
            1
        );
    });

    test('возвращает 409 при удалении назначенного специалиста', async () => {
        const site = await Site.create({
            name: 'Тестовая площадка',
            code: 'TECHNICIAN-DELETE-SITE',
            region: 'Москва',
            latitude: 55.7558,
            longitude: 37.6176,
        });

        const equipment = await Equipment.create({
            siteId: site.id,
            name: 'Тестовая турбина',
            type: 'turbine',
            serialNumber: 'TECHNICIAN-DELETE-EQUIPMENT',
            status: 'operational',
            installedAt: '2025-01-01',
        });

        const maintenanceRequest = await MaintenanceRequest.create({
            equipmentId: equipment.id,
            title: 'Проверить турбину',
            description: 'Проверка ограничения удаления специалиста',
            priority: 'high',
            status: 'new',
            author: 'admin@example.com',
        });

        const technician = await Technician.create({
            fullName: 'Назначенный специалист',
            specialization: 'Турбины',
            employeeNumber: 'ASSIGNED-TECH',
        });

        await RequestAssignee.create({
            requestId: maintenanceRequest.id,
            technicianId: technician.id,
            role: 'lead',
            hours: 2,
        });

        const response = await request(app)
            .delete(`/api/technicians/${technician.id}`)
            .set('Authorization', authorization(admin));

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('CONFLICT');
        expect(await Technician.count({ where: { id: technician.id } })).toBe(
            1
        );

        const removeAssignmentResponse = await request(app)
            .delete(
                `/api/requests/${maintenanceRequest.id}/assignees/${technician.id}`
            )
            .set('Authorization', authorization(admin));

        expect(removeAssignmentResponse.status).toBe(204);
        expect(
            await RequestAssignee.count({
                where: {
                    requestId: maintenanceRequest.id,
                    technicianId: technician.id,
                },
            })
        ).toBe(0);

        const deleteAfterUnassignResponse = await request(app)
            .delete(`/api/technicians/${technician.id}`)
            .set('Authorization', authorization(admin));

        expect(deleteAfterUnassignResponse.status).toBe(204);
    });
});
