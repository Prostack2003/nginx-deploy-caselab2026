import * as siteRepository from '../repositories/site.repository.js';
import { NotFoundError } from '../errors/not-found.error.js';

function mapSiteToResponse(site) {
    return {
        id: site.id,
        name: site.name,
        code: site.code,
        region: site.region,
        location: {
            lat: Number(site.latitude),
            lon: Number(site.longitude),
        },
        createdAt: site.createdAt,
        updatedAt: site.updatedAt,
    };
}

async function createSite(data) {
    const site = await siteRepository.create(data);

    return mapSiteToResponse(site);
}

async function listSites(query = {}) {
    const { rows, count } = await siteRepository.findAll(query);

    return {
        items: rows.map(mapSiteToResponse),
        meta: {
            total: count,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        },
    };
}

async function getSiteById(siteId) {
    const site = await siteRepository.findById(siteId);

    if (site === null) {
        throw new NotFoundError(
            `Площадка с идентификатором "${siteId}" не найдена`
        );
    }

    return mapSiteToResponse(site);
}

async function updateSite(siteId, changes) {
    const site = await siteRepository.update(siteId, changes);

    if (site === null) {
        throw new NotFoundError(
            `Площадка с идентификатором "${siteId}" не найдена`
        );
    }

    return mapSiteToResponse(site);
}

async function deleteSite(siteId) {
    const deleted = await siteRepository.remove(siteId);

    if (!deleted) {
        throw new NotFoundError(
            `Площадка с идентификатором "${siteId}" не найдена`
        );
    }
}

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

export {
    createSite,
    listSites,
    getSiteById,
    updateSite,
    deleteSite,
    getSiteSummary,
};
