import { ForbiddenError } from '../errors/forbidden.error.js';
import { UnauthorizedError } from '../errors/unauthorized.error.js';

function authorizeRoles(...allowedRoles) {
    return function authorize(request, response, next) {
        if (!request.user) {
            return next(new UnauthorizedError());
        }

        if (!allowedRoles.includes(request.user.role)) {
            return next(new ForbiddenError());
        }

        return next();
    };
}

export { authorizeRoles };
