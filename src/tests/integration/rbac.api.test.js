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

async function createFixture() {
    const site = await Site.create({
        name: 'Тестовая площадка',
        code: 'TEST-SITE',
        region: 'Московская область',
        latitude: 55.7558,
        longitude: 37.6176,
    });

    const equipment = await Equipment.create({
        siteId: site.id,
        name: 'Тестовая турбина',
        type: 'turbine',
        serialNumber: 'TEST-EQUIPMENT-001',
        status: 'operational',
        installedAt: '2025-01-01',
    });

    const maintenanceRequest = await MaintenanceRequest.create({
        equipmentId: equipment.id,
        title: 'Проверить тестовую турбину',
        description: 'Интеграционный RBAC-тест',
        priority: 'high',
        status: 'new',
        author: 'admin@example.com',
    });

    const assignedTechnician = await Technician.create({
        fullName: 'Назначенный специалист',
        specialization: 'Турбины',
        employeeNumber: 'TECH-001',
    });

    const unassignedTechnician = await Technician.create({
        fullName: 'Неназначенный специалист',
        specialization: 'Электрика',
        employeeNumber: 'TECH-002',
    });

    await RequestAssignee.create({
        requestId: maintenanceRequest.id,
        technicianId: assignedTechnician.id,
        role: 'lead',
        hours: 2,
    });

    const viewer = await User.create({
        email: 'viewer@example.com',
        passwordHash: 'not-used-in-rbac-test',
        role: 'viewer',
        technicianId: null,
        isActive: true,
    });

    const assignedUser = await User.create({
        email: 'assigned@example.com',
        passwordHash: 'not-used-in-rbac-test',
        role: 'technician',
        technicianId: assignedTechnician.id,
        isActive: true,
    });

    const unassignedUser = await User.create({
        email: 'unassigned@example.com',
        passwordHash: 'not-used-in-rbac-test',
        role: 'technician',
        technicianId: unassignedTechnician.id,
        isActive: true,
    });

    const admin = await User.create({
        email: 'admin@example.com',
        passwordHash: 'not-used-in-rbac-test',
        role: 'admin',
        technicianId: null,
        isActive: true,
    });

    return {
        equipment,
        maintenanceRequest,
        viewer,
        assignedUser,
        unassignedUser,
        admin,
    };
}

let fixture;

beforeAll(async () => {
    await connectTestDatabase();
});

beforeEach(async () => {
    await truncateTestDatabase();
    fixture = await createFixture();
});

afterAll(async () => {
    await disconnectTestDatabase();
});

describe('domain RBAC', () => {
    test('защищает чтение и разрешает изменения оборудования только admin', async () => {
        const unauthorizedResponse = await request(app).get('/api/equipment');

        expect(unauthorizedResponse.status).toBe(401);

        const viewerReadResponse = await request(app)
            .get('/api/equipment')
            .set('Authorization', authorization(fixture.viewer));

        expect(viewerReadResponse.status).toBe(200);

        const viewerWriteResponse = await request(app)
            .post('/api/equipment')
            .set('Authorization', authorization(fixture.viewer))
            .send({});

        expect(viewerWriteResponse.status).toBe(403);
        expect(viewerWriteResponse.body.error.code).toBe('FORBIDDEN');

        const adminWriteResponse = await request(app)
            .post('/api/equipment')
            .set('Authorization', authorization(fixture.admin))
            .send({});

        expect(adminWriteResponse.status).toBe(422);
        expect(adminWriteResponse.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('разрешает смену статуса только admin или назначенному technician', async () => {
        const statusUrl = `/api/requests/${fixture.maintenanceRequest.id}/status`;

        const viewerResponse = await request(app)
            .patch(statusUrl)
            .set('Authorization', authorization(fixture.viewer))
            .send({ status: 'in_progress' });

        expect(viewerResponse.status).toBe(403);

        const unassignedResponse = await request(app)
            .patch(statusUrl)
            .set('Authorization', authorization(fixture.unassignedUser))
            .send({ status: 'in_progress' });

        expect(unassignedResponse.status).toBe(403);
        expect(unassignedResponse.body.error.code).toBe('FORBIDDEN');

        const assignedResponse = await request(app)
            .patch(statusUrl)
            .set('Authorization', authorization(fixture.assignedUser))
            .send({ status: 'in_progress' });

        expect(assignedResponse.status).toBe(200);
        expect(assignedResponse.body.data.status).toBe('in_progress');

        const adminResponse = await request(app)
            .patch(statusUrl)
            .set('Authorization', authorization(fixture.admin))
            .send({ status: 'done' });

        expect(adminResponse.status).toBe(200);
        expect(adminResponse.body.data.status).toBe('done');
    });

    test('записывает email аутентифицированного автора заявки', async () => {
        const response = await request(app)
            .post('/api/requests')
            .set('Authorization', authorization(fixture.assignedUser))
            .send({
                equipmentId: fixture.equipment.id,
                title: 'Новая заявка специалиста',
                description: 'Проверка автора заявки',
                priority: 'medium',
            });

        expect(response.status).toBe(201);
        expect(response.body.data.author).toBe(fixture.assignedUser.email);
    });
});
