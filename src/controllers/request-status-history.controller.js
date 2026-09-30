import * as requestStatusHistoryService from '../services/request-status-history.service.js';

async function listRequestStatusHistory(request, response) {
    const history = await requestStatusHistoryService.listRequestStatusHistory(
        request.params.id
    );

    return response.status(200).json({
        data: history,
    });
}

export { listRequestStatusHistory };
