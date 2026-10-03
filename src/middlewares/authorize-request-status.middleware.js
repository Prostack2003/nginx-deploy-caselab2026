import { ForbiddenError } from '../errors/forbidden.error.js';
import { UnauthorizedError } from '../errors/unauthorized.error.js';
import * as requestAssigneeRepository from '../repositories/request-assignee.repository.js';

async function authorizeRequestStatusChange(request, response, next) {
    const user = request.user;

    if (!user) {
        return next(new UnauthorizedError());
    }

    if (user.role === 'admin') {
        return next();
    }

    if (user.role !== 'technician' || !user.technicianId) {
        return next(new ForbiddenError());
    }

    const isAssigned = await requestAssigneeRepository.isTechnicianAssigned(
        request.params.id,
        user.technicianId
    );

    if (!isAssigned) {
        return next(new ForbiddenError('Специалист не назначен на эту заявку'));
    }

    return next();
}

export { authorizeRequestStatusChange };
