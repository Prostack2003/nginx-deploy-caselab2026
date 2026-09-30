import { jest } from '@jest/globals';

const userRepositoryMock = {
    createViewer: jest.fn(),
    findByEmailWithPassword: jest.fn(),
};

const refreshSessionRepositoryMock = {
    create: jest.fn(),
};

const passwordSecurityMock = {
    hashPassword: jest.fn(),
    verifyPassword: jest.fn(),
};

const tokenSecurityMock = {
    createAccessToken: jest.fn(() => 'access-token'),
    createRefreshToken: jest.fn(() => 'refresh-token'),
    hashRefreshToken: jest.fn(() => 'refresh-token-hash'),
    createRefreshExpiresAt: jest.fn(() => new Date('2026-10-07T12:00:00.000Z')),
};

jest.unstable_mockModule(
    '../../repositories/user.repository.js',
    () => userRepositoryMock
);

jest.unstable_mockModule(
    '../../repositories/refresh-session.repository.js',
    () => refreshSessionRepositoryMock
);

jest.unstable_mockModule(
    '../../security/password.js',
    () => passwordSecurityMock
);

jest.unstable_mockModule('../../security/tokens.js', () => tokenSecurityMock);

const { login, register } = await import('../../services/auth.service.js');

const publicUser = {
    id: '10000000-0000-4000-8000-000000000001',
    email: 'user@example.com',
    role: 'viewer',
    technicianId: null,
    isActive: true,
    createdAt: new Date('2026-09-30T12:00:00.000Z'),
    updatedAt: new Date('2026-09-30T12:00:00.000Z'),
};

const internalUser = {
    ...publicUser,
    passwordHash: 'stored-password-hash',
};

const invalidCredentials = {
    code: 'INVALID_CREDENTIALS',
    message: 'Неверный email или пароль',
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('register', () => {
    test('хеширует пароль и создаёт viewer', async () => {
        passwordSecurityMock.hashPassword.mockResolvedValue(
            'created-password-hash'
        );
        userRepositoryMock.createViewer.mockResolvedValue(publicUser);

        const result = await register({
            email: 'user@example.com',
            password: 'StrongPassword123',
        });

        expect(passwordSecurityMock.hashPassword).toHaveBeenCalledWith(
            'StrongPassword123'
        );
        expect(userRepositoryMock.createViewer).toHaveBeenCalledWith({
            email: 'user@example.com',
            passwordHash: 'created-password-hash',
        });
        expect(result).toEqual(publicUser);
        expect(result).not.toHaveProperty('passwordHash');
    });
});

describe('login', () => {
    test('возвращает пользователя и создаёт пару токенов', async () => {
        userRepositoryMock.findByEmailWithPassword.mockResolvedValue(
            internalUser
        );
        passwordSecurityMock.verifyPassword.mockResolvedValue(true);
        refreshSessionRepositoryMock.create.mockResolvedValue({});

        const result = await login({
            email: 'user@example.com',
            password: 'StrongPassword123',
        });

        expect(passwordSecurityMock.verifyPassword).toHaveBeenCalledWith(
            'StrongPassword123',
            'stored-password-hash'
        );

        expect(refreshSessionRepositoryMock.create).toHaveBeenCalledWith(
            {
                userId: publicUser.id,
                tokenHash: 'refresh-token-hash',
                expiresAt: new Date('2026-10-07T12:00:00.000Z'),
            },
            {
                transaction: undefined,
            }
        );

        expect(result).toEqual({
            user: publicUser,
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        });
        expect(result.user).not.toHaveProperty('passwordHash');
    });

    test('возвращает одинаковую ошибку для неизвестного email', async () => {
        userRepositoryMock.findByEmailWithPassword.mockResolvedValue(null);

        await expect(
            login({
                email: 'missing@example.com',
                password: 'StrongPassword123',
            })
        ).rejects.toMatchObject(invalidCredentials);

        expect(passwordSecurityMock.verifyPassword).not.toHaveBeenCalled();
        expect(refreshSessionRepositoryMock.create).not.toHaveBeenCalled();
    });

    test('возвращает одинаковую ошибку для неверного пароля', async () => {
        userRepositoryMock.findByEmailWithPassword.mockResolvedValue(
            internalUser
        );
        passwordSecurityMock.verifyPassword.mockResolvedValue(false);

        await expect(
            login({
                email: 'user@example.com',
                password: 'WrongPassword123',
            })
        ).rejects.toMatchObject(invalidCredentials);

        expect(refreshSessionRepositoryMock.create).not.toHaveBeenCalled();
    });

    test('не разрешает вход неактивному пользователю', async () => {
        userRepositoryMock.findByEmailWithPassword.mockResolvedValue({
            ...internalUser,
            isActive: false,
        });
        passwordSecurityMock.verifyPassword.mockResolvedValue(true);

        await expect(
            login({
                email: 'user@example.com',
                password: 'StrongPassword123',
            })
        ).rejects.toMatchObject(invalidCredentials);

        expect(refreshSessionRepositoryMock.create).not.toHaveBeenCalled();
    });
});
