import * as reportService from '../services/report.service.js';

async function getEquipmentLoad(request, response) {
    const report = await reportService.getEquipmentLoad(request.validatedQuery);

    return response.status(200).json({
        data: report,
    });
}

export { getEquipmentLoad };
