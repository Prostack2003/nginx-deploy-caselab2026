import * as requestService from '../services/request.service.js';

async function createRequest(request, response) {
    const createdRequest = await requestService.createRequest(request.body);

    response.location(`/api/requests/${createdRequest.id}`);

    return response.status(201).json({
        data: createdRequest,
    });
}

async function updateRequest(request, response) {
    const id = request.params.id;

    const requestItem = await requestService.updateRequest(id, request.body);

    return response.status(200).json({
        data: requestItem,
    });
}

async function deleteRequest(request, response) {
    const id = request.params.id;
    await requestService.deleteRequest(id);

    return response.status(204).send();
}

async function listRequests(request, response) {
    const result = await requestService.listRequests(request.validatedQuery);

    return response.status(200).json({
        data: result.items,
        meta: result.meta,
    });
}

async function getRequestById(request, response) {
    const id = request.params.id;
    const requestItem = await requestService.getRequestById(id);

    return response.status(200).json({
        data: requestItem,
    });
}

async function listRequestsByEquipmentId(request, response) {
    const id = request.params.id;
    const { items, meta } = await requestService.listRequestsByEquipmentId(
        id,
        request.validatedQuery
    );

    return response.status(200).json({
        data: items,
        meta,
    });
}

async function changeRequestStatus(request, response) {
    const id = request.params.id;
    const status = request.body.status;
    const requestItem = await requestService.changeRequestStatus(id, status);

    return response.status(200).json({
        data: requestItem,
    });
}

export {
    createRequest,
    updateRequest,
    deleteRequest,
    changeRequestStatus,
    listRequests,
    listRequestsByEquipmentId,
    getRequestById,
};
