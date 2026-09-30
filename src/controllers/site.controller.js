import * as siteService from '../services/site.service.js';

async function getSiteSummary(request, response) {
    const summary = await siteService.getSiteSummary(request.params.id);

    return response.status(200).json({
        data: summary,
    });
}

export { getSiteSummary };
