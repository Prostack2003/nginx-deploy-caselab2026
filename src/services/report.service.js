import * as reportRepository from '../repositories/report.repository.js';

async function getEquipmentLoad(query) {
    return reportRepository.findEquipmentLoad(query);
}

export { getEquipmentLoad };
