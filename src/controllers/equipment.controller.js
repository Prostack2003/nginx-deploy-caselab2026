import * as equipmentService from '../services/equipment.service.js';

async function createEquipment(request, response) {
    const equipment = await equipmentService.createEquipment(request.body);

    response.location(`/api/equipment/${equipment.id}`);

    return response.status(201).json({
        data: equipment,
    });
}

async function updateEquipment(request, response) {
    const id = request.params.id;
    const equipment = await equipmentService.updateEquipment(id, request.body);

    return response.status(200).json({
        data: equipment,
    });
}

async function deleteEquipment(request, response) {
    const id = request.params.id;
    await equipmentService.deleteEquipment(id);

    return response.status(204).send();
}

async function listEquipment(request, response) {
    const { items, meta } = await equipmentService.listEquipment(
        request.validatedQuery
    );

    return response.status(200).json({
        data: items,
        meta,
    });
}

async function getEquipmentById(request, response) {
    const id = request.params.id;
    const equipment = await equipmentService.getEquipmentById(id);

    return response.status(200).json({
        data: equipment,
    });
}

export {
    createEquipment,
    updateEquipment,
    deleteEquipment,
    listEquipment,
    getEquipmentById,
};
