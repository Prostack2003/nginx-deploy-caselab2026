import * as technicianService from '../services/technician.service.js';

async function createTechnician(request, response) {
    const technician = await technicianService.createTechnician(request.body);

    response.location(`/api/technicians/${technician.id}`);

    return response.status(201).json({
        data: technician,
    });
}

async function listTechnicians(request, response) {
    const { items, meta } = await technicianService.listTechnicians(
        request.validatedQuery
    );

    return response.status(200).json({
        data: items,
        meta,
    });
}

async function getTechnicianById(request, response) {
    const technician = await technicianService.getTechnicianById(
        request.params.id
    );

    return response.status(200).json({
        data: technician,
    });
}

async function updateTechnician(request, response) {
    const technician = await technicianService.updateTechnician(
        request.params.id,
        request.body
    );

    return response.status(200).json({
        data: technician,
    });
}

async function deleteTechnician(request, response) {
    await technicianService.deleteTechnician(request.params.id);

    return response.status(204).send();
}

export {
    createTechnician,
    listTechnicians,
    getTechnicianById,
    updateTechnician,
    deleteTechnician,
};
