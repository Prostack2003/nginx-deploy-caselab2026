import * as requestRepository from '../repositories/request.repository.js';
import * as requestStatusHistoryRepository from '../repositories/request-status-history.repository.js';
import { NotFoundError } from '../errors/not-found.error.js';

async function listRequestStatusHistory(requestId) {
    const requestExists = await requestRepository.existsById(requestId);

    if (!requestExists) {
        throw new NotFoundError(
            `Заявка с идентификатором "${requestId}" не найдена`
        );
    }

    return requestStatusHistoryRepository.findByRequestId(requestId);
}

export { listRequestStatusHistory };
