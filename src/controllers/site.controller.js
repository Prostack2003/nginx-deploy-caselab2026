import * as siteService from '../services/site.service.js';

async function createSite(request, response) {
    const site = await siteService.createSite(request.body);

    response.location(`/api/sites/${site.id}`);

    return response.status(201).json({
        data: site,
    });
}

async function listSites(request, response) {
    const { items, meta } = await siteService.listSites(request.validatedQuery);

    return response.status(200).json({
        data: items,
        meta,
    });
}

async function getSiteById(request, response) {
    const site = await siteService.getSiteById(request.params.id);

    return response.status(200).json({
        data: site,
    });
}

async function updateSite(request, response) {
    const site = await siteService.updateSite(request.params.id, request.body);

    return response.status(200).json({
        data: site,
    });
}

async function deleteSite(request, response) {
    await siteService.deleteSite(request.params.id);

    return response.status(204).send();
}

async function getSiteSummary(request, response) {
    const summary = await siteService.getSiteSummary(request.params.id);

    return response.status(200).json({
        data: summary,
    });
}

export {
    createSite,
    listSites,
    getSiteById,
    updateSite,
    deleteSite,
    getSiteSummary,
};
