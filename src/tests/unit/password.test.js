import { hashPassword, verifyPassword } from '../../security/password.js';

describe('password security', () => {
    const password = 'StrongPassword123';
    let passwordHash;

    beforeAll(async () => {
        passwordHash = await hashPassword(password);
    });

    test('хеширует пароль без хранения исходного значения', () => {
        expect(passwordHash).not.toBe(password);
        expect(passwordHash).toEqual(expect.any(String));
    });

    test('подтверждает правильный пароль', async () => {
        await expect(verifyPassword(password, passwordHash)).resolves.toBe(
            true
        );
    });

    test('отклоняет неправильный пароль', async () => {
        await expect(
            verifyPassword('WrongPassword123', passwordHash)
        ).resolves.toBe(false);
    });
});
