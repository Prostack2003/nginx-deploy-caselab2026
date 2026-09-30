import * as requestAssigneeRepository from '../repositories/request-assignee.repository.js';
import { NotFoundError } from '../errors/not-found.error.js';

function mapAssignmentToResponse(assignment) {
    return {
        ...assignment.technician,
        role: assignment.role,
        hours: Number(assignment.hours),
    };
}

async function replaceRequestTeam(requestId, data) {
    const assignments = await requestAssigneeRepository.replaceTeam(
        requestId,
        data.assignees
    );

    return assignments.map(mapAssignmentToResponse);
}

async function removeRequestAssignee(requestId, technicianId) {
    const removed = await requestAssigneeRepository.remove(
        requestId,
        technicianId
    );

    if (!removed) {
        throw new NotFoundError(
            `Специалист "${technicianId}" не назначен на заявку "${requestId}"`
        );
    }
}

export { replaceRequestTeam, removeRequestAssignee };
