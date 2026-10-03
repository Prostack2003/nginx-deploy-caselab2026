import { jest } from '@jest/globals';
import { authorizeRoles } from '../../middlewares/authorize-roles.middleware.js';
import { ForbiddenError } from '../../errors/forbidden.error.js';
import { UnauthorizedError } from '../../errors/unauthorized.error.js';

function executeMiddleware(role, allowedRoles) {
    const request = role
        ? {
              user: {
                  role,
              },
          }
        : {};

    const next = jest.fn();

    authorizeRoles(...allowedRoles)(request, {}, next);

    return next;
}

describe('authorizeRoles', () => {
    test.each(['viewer', 'technician', 'admin'])(
        'разрешает роль %s, если она указана в политике',
        (role) => {
            const next = executeMiddleware(role, [
                'viewer',
                'technician',
                'admin',
            ]);

            expect(next).toHaveBeenCalledWith();
        }
    );

    test('разрешает маршрут только admin', () => {
        const next = executeMiddleware('admin', ['admin']);

        expect(next).toHaveBeenCalledWith();
    });

    test('возвращает ForbiddenError для неподходящей роли', () => {
        const next = executeMiddleware('viewer', ['admin']);

        expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
        expect(next.mock.calls[0][0].code).toBe('FORBIDDEN');
    });

    test('возвращает UnauthorizedError без пользователя', () => {
        const next = executeMiddleware(null, ['admin']);

        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        expect(next.mock.calls[0][0].code).toBe('UNAUTHORIZED');
    });
});
