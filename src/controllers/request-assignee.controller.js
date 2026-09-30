import * as requestAssigneeService from '../services/request-assignee.service.js';

async function replaceRequestTeam(request, response) {
    const team = await requestAssigneeService.replaceRequestTeam(
        request.params.id,
        request.body
    );

    return response.status(200).json({
        data: team,
    });
}

async function removeRequestAssignee(request, response) {
    await requestAssigneeService.removeRequestAssignee(
        request.params.id,
        request.params.userId
    );

    return response.status(204).send();
}

export { replaceRequestTeam, removeRequestAssignee };
