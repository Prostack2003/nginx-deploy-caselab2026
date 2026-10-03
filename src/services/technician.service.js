import * as technicianRepository from '../repositories/technician.repository.js';
import { NotFoundError } from '../errors/not-found.error.js';

function mapTechnicianToResponse(technician) {
    return {
        id: technician.id,
        fullName: technician.fullName,
        specialization: technician.specialization,
        employeeNumber: technician.employeeNumber,
        createdAt: technician.createdAt,
        updatedAt: technician.updatedAt,
    };
}

async function createTechnician(data) {
    const technician = await technicianRepository.create(data);

    return mapTechnicianToResponse(technician);
}

async function listTechnicians(query = {}) {
    const { rows, count } = await technicianRepository.findAll(query);

    return {
        items: rows.map(mapTechnicianToResponse),
        meta: {
            total: count,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        },
    };
}

async function getTechnicianById(technicianId) {
    const technician = await technicianRepository.findById(technicianId);

    if (technician === null) {
        throw new NotFoundError(
            `Специалист с идентификатором "${technicianId}" не найден`
        );
    }

    return mapTechnicianToResponse(technician);
}

async function updateTechnician(technicianId, changes) {
    const technician = await technicianRepository.update(technicianId, changes);

    if (technician === null) {
        throw new NotFoundError(
            `Специалист с идентификатором "${technicianId}" не найден`
        );
    }

    return mapTechnicianToResponse(technician);
}

async function deleteTechnician(technicianId) {
    const deleted = await technicianRepository.remove(technicianId);

    if (!deleted) {
        throw new NotFoundError(
            `Специалист с идентификатором "${technicianId}" не найден`
        );
    }
}

export {
    createTechnician,
    listTechnicians,
    getTechnicianById,
    updateTechnician,
    deleteTechnician,
};
