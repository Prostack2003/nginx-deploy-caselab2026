import request from 'supertest';
import { app } from '../../app.js';
import { Technician, User } from '../../database/models/index.js';
import { createAccessToken } from '../../security/tokens.js';
import {
    connectTestDatabase,
    disconnectTestDatabase,
    truncateTestDatabase,
} from '../helpers/database.js';

function authorization(user) {
    return `Bearer ${createAccessToken(user.id)}`;
}

async function createTechnician(employeeNumber) {
    return Technician.create({
        fullName: `Специалист ${employeeNumber}`,
        specialization: 'Обслуживание оборудования',
        employeeNumber,
    });
}

let admin;
let viewer;

beforeAll(async () => {
    await connectTestDatabase();
});

beforeEach(async () => {
    await truncateTestDatabase();

    admin = await User.create({
        email: 'admin-users@example.com',
        passwordHash: 'admin-password-hash',
        role: 'admin',
        technicianId: null,
        isActive: true,
    });

    viewer = await User.create({
        email: 'viewer-users@example.com',
        passwordHash: 'viewer-password-hash',
        role: 'viewer',
        technicianId: null,
        isActive: true,
    });
});

afterAll(async () => {
    await disconnectTestDatabase();
});

describe('users access administration', () => {
    test('требует access-токен', async () => {
        const response = await request(app).get('/api/users');

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    test('запрещает viewer просматривать и изменять пользователей', async () => {
        const listResponse = await request(app)
            .get('/api/users')
            .set('Authorization', authorization(viewer));

        expect(listResponse.status).toBe(403);
        expect(listResponse.body.error.code).toBe('FORBIDDEN');

        const updateResponse = await request(app)
            .patch(`/api/users/${viewer.id}/access`)
            .set('Authorization', authorization(viewer))
            .send({ isActive: false });

        expect(updateResponse.status).toBe(403);
        expect(updateResponse.body.error.code).toBe('FORBIDDEN');
    });

    test('возвращает admin список пользователей без хешей паролей', async () => {
        const response = await request(app)
            .get('/api/users?page=1&limit=10&sortBy=email&order=asc')
            .set('Authorization', authorization(admin));

        expect(response.status).toBe(200);
        expect(response.body.meta).toEqual({
            total: 2,
            page: 1,
            limit: 10,
        });
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0].email).toBe(admin.email);

        for (const user of response.body.data) {
            expect(user).not.toHaveProperty('passwordHash');
        }
    });

    test('позволяет admin назначить пользователю роль technician', async () => {
        const technician = await createTechnician('USER-ACCESS-001');

        const response = await request(app)
            .patch(`/api/users/${viewer.id}/access`)
            .set('Authorization', authorization(admin))
            .send({
                role: 'technician',
                technicianId: technician.id,
            });

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            id: viewer.id,
            role: 'technician',
            technicianId: technician.id,
            isActive: true,
        });
        expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    test('позволяет admin изменить активность пользователя', async () => {
        const response = await request(app)
            .patch(`/api/users/${viewer.id}/access`)
            .set('Authorization', authorization(admin))
            .send({ isActive: false });

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            id: viewer.id,
            role: 'viewer',
            technicianId: null,
            isActive: false,
        });

        await viewer.reload();
        expect(viewer.isActive).toBe(false);
    });

    test('проверяет соответствие роли и связи со специалистом', async () => {
        const technician = await createTechnician('USER-ACCESS-002');

        const missingTechnicianResponse = await request(app)
            .patch(`/api/users/${viewer.id}/access`)
            .set('Authorization', authorization(admin))
            .send({ role: 'technician' });

        expect(missingTechnicianResponse.status).toBe(422);
        expect(missingTechnicianResponse.body.error.code).toBe(
            'VALIDATION_ERROR'
        );

        const forbiddenLinkResponse = await request(app)
            .patch(`/api/users/${viewer.id}/access`)
            .set('Authorization', authorization(admin))
            .send({ technicianId: technician.id });

        expect(forbiddenLinkResponse.status).toBe(422);
        expect(forbiddenLinkResponse.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('возвращает 404 для неизвестного пользователя или специалиста', async () => {
        const missingUserId = '00000000-0000-4000-8000-000000000091';
        const missingTechnicianId = '00000000-0000-4000-8000-000000000092';

        const missingUserResponse = await request(app)
            .patch(`/api/users/${missingUserId}/access`)
            .set('Authorization', authorization(admin))
            .send({ isActive: false });

        expect(missingUserResponse.status).toBe(404);
        expect(missingUserResponse.body.error.code).toBe('NOT_FOUND');

        const missingTechnicianResponse = await request(app)
            .patch(`/api/users/${viewer.id}/access`)
            .set('Authorization', authorization(admin))
            .send({
                role: 'technician',
                technicianId: missingTechnicianId,
            });

        expect(missingTechnicianResponse.status).toBe(404);
        expect(missingTechnicianResponse.body.error.code).toBe('NOT_FOUND');
    });

    test('возвращает 409 при повторной привязке специалиста', async () => {
        const technician = await createTechnician('USER-ACCESS-003');

        await User.create({
            email: 'linked-technician@example.com',
            passwordHash: 'not-used',
            role: 'technician',
            technicianId: technician.id,
            isActive: true,
        });

        const response = await request(app)
            .patch(`/api/users/${viewer.id}/access`)
            .set('Authorization', authorization(admin))
            .send({
                role: 'technician',
                technicianId: technician.id,
            });

        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe('CONFLICT');
    });

    test('не позволяет отключить или понизить последнего активного admin', async () => {
        const disableResponse = await request(app)
            .patch(`/api/users/${admin.id}/access`)
            .set('Authorization', authorization(admin))
            .send({ isActive: false });

        expect(disableResponse.status).toBe(409);
        expect(disableResponse.body.error.code).toBe('CONFLICT');

        const demoteResponse = await request(app)
            .patch(`/api/users/${admin.id}/access`)
            .set('Authorization', authorization(admin))
            .send({ role: 'viewer' });

        expect(demoteResponse.status).toBe(409);
        expect(demoteResponse.body.error.code).toBe('CONFLICT');

        await admin.reload();
        expect(admin.role).toBe('admin');
        expect(admin.isActive).toBe(true);
    });

    test('разрешает понизить admin при наличии второго активного admin', async () => {
        await User.create({
            email: 'second-admin@example.com',
            passwordHash: 'not-used',
            role: 'admin',
            technicianId: null,
            isActive: true,
        });

        const response = await request(app)
            .patch(`/api/users/${admin.id}/access`)
            .set('Authorization', authorization(admin))
            .send({ role: 'viewer' });

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            id: admin.id,
            role: 'viewer',
            technicianId: null,
            isActive: true,
        });
    });

    test('отклоняет пустое тело и неизвестные поля', async () => {
        const emptyBodyResponse = await request(app)
            .patch(`/api/users/${viewer.id}/access`)
            .set('Authorization', authorization(admin))
            .send({});

        expect(emptyBodyResponse.status).toBe(422);
        expect(emptyBodyResponse.body.error.code).toBe('VALIDATION_ERROR');

        const unknownFieldResponse = await request(app)
            .patch(`/api/users/${viewer.id}/access`)
            .set('Authorization', authorization(admin))
            .send({ passwordHash: 'must-not-be-updated' });

        expect(unknownFieldResponse.status).toBe(422);
        expect(unknownFieldResponse.body.error.code).toBe('VALIDATION_ERROR');
    });
});
