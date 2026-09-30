import * as siteRepository from '../repositories/site.repository.js';
import { NotFoundError } from '../errors/not-found.error.js';

async function getSiteSummary(siteId) {
    const summary = await siteRepository.findSummaryById(siteId);

    if (summary === null) {
        throw new NotFoundError(
            `Площадка с идентификатором "${siteId}" не найдена`
        );
    }

    return {
        site: {
            id: summary.id,
            name: summary.name,
            code: summary.code,
            region: summary.region,
            location: {
                lat: Number(summary.latitude),
                lon: Number(summary.longitude),
            },
        },
        requests: {
            total: summary.totalRequests,
            byStatus: summary.requestsByStatus,
            byPriority: summary.requestsByPriority,
            averageClosureHours: summary.averageClosureHours,
        },
    };
}

export { getSiteSummary };
