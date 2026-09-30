import {
    loginBodySchema,
    registerBodySchema,
} from '../../validators/auth.schemas.js';

describe('registerBodySchema', () => {
    test('нормализует email и принимает надёжный пароль', () => {
        const result = registerBodySchema.parse({
            email: '  User@Example.COM ',
            password: 'StrongPassword123',
        });

        expect(result).toEqual({
            email: 'user@example.com',
            password: 'StrongPassword123',
        });
    });

    test('отклоняет слабый пароль', () => {
        const result = registerBodySchema.safeParse({
            email: 'user@example.com',
            password: 'password',
        });

        expect(result.success).toBe(false);
    });

    test('отклоняет неизвестные поля', () => {
        const result = registerBodySchema.safeParse({
            email: 'user@example.com',
            password: 'StrongPassword123',
            role: 'admin',
        });

        expect(result.success).toBe(false);
    });
});

describe('loginBodySchema', () => {
    test('принимает непустой пароль и нормализует email', () => {
        const result = loginBodySchema.parse({
            email: 'ADMIN@EXAMPLE.COM',
            password: 'password',
        });

        expect(result).toEqual({
            email: 'admin@example.com',
            password: 'password',
        });
    });
});
