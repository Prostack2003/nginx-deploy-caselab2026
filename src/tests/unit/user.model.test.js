import { User } from '../../database/models/user.model.js';

const baseUser = {
    email: 'user@example.com',
    passwordHash: 'test-password-hash',
};

describe('User role and technician validation', () => {
    test('разрешает viewer без связи со специалистом', async () => {
        const user = User.build({
            ...baseUser,
            role: 'viewer',
        });

        await expect(user.validate()).resolves.toBeDefined();
    });

    test('разрешает technician со связью со специалистом', async () => {
        const user = User.build({
            ...baseUser,
            role: 'technician',
            technicianId: '10000000-0000-4000-8000-000000000001',
        });

        await expect(user.validate()).resolves.toBeDefined();
    });

    test('запрещает technician без связи со специалистом', async () => {
        const user = User.build({
            ...baseUser,
            role: 'technician',
            technicianId: null,
        });

        await expect(user.validate()).rejects.toThrow(
            'Роль technician требует связь со специалистом'
        );
    });

    test('запрещает viewer со связью со специалистом', async () => {
        const user = User.build({
            ...baseUser,
            role: 'viewer',
            technicianId: '10000000-0000-4000-8000-000000000001',
        });

        await expect(user.validate()).rejects.toThrow(
            'для остальных ролей связь запрещена'
        );
    });
});
