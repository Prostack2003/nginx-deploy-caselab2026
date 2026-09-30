import { randomUUID } from 'node:crypto';
import * as equipmentRepository from '../repositories/equipment.repository.js';
import * as requestRepository from '../repositories/request.repository.js';
import { NotFoundError } from '../errors/not-found.error.js';
import { ConflictError } from '../errors/conflict.error.js';
import { ValidationError } from '../errors/validation.error.js';

async function createEquipment(data) {
    validateInstalledAt(data.installedAt);
    const existingEquipment = await equipmentRepository.findBySerialNumber(
        data.serialNumber
    );

    if (existingEquipment !== null) {
        throw new ConflictError(
            `Оборудование с серийным номером "${data.serialNumber}" уже существует`
        );
    }

    const equipment = {
        id: randomUUID(),
        name: data.name,
        type: data.type,
        serialNumber: data.serialNumber,
        location: structuredClone(data.location),
        status: data.status,
        installedAt: data.installedAt,
    };

    const createdEquipment = await equipmentRepository.create(equipment);

    return mapEquipmentToResponse(createdEquipment);
}

function mapEquipmentToResponse(equipment) {
    return {
        id: equipment.id,
        name: equipment.name,
        type: equipment.type,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        installedAt: equipment.installedAt,
        createdAt: equipment.createdAt,
        updatedAt: equipment.updatedAt,
        passport: equipment.passport,
        location: {
            lat: Number(equipment.site.latitude),
            lon: Number(equipment.site.longitude),
        },
    };
}

async function listEquipment(query = {}) {
    const { rows, count } = await equipmentRepository.findAll(query);

    const items = rows.map(mapEquipmentToResponse);

    return {
        items,
        meta: {
            total: count,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        },
    };
}

async function getEquipmentById(equipmentId) {
    const equipment = await equipmentRepository.findById(equipmentId);

    if (equipment === null) {
        throw new NotFoundError(
            `Оборудование с идентификатором "${equipmentId}" не найдено`
        );
    }

    return mapEquipmentToResponse(equipment);
}

async function updateEquipment(equipmentId, changes) {
    await getEquipmentById(equipmentId);

    if (Object.keys(changes).length === 0) {
        throw new ValidationError('Переданы некорректные данные', [
            {
                field: 'body',
                message: 'Укажите хотя бы одно поле для обновления',
            },
        ]);
    }

    if (changes.serialNumber !== undefined) {
        const existingEquipment = await equipmentRepository.findBySerialNumber(
            changes.serialNumber
        );

        if (
            existingEquipment !== null &&
            existingEquipment.id !== equipmentId
        ) {
            throw new ConflictError(
                `Оборудование с серийным номером "${changes.serialNumber}" уже существует`
            );
        }
    }

    if (changes.installedAt !== undefined) {
        validateInstalledAt(changes.installedAt);
    }

    const updatedEquipment = await equipmentRepository.update(
        equipmentId,
        changes
    );

    return mapEquipmentToResponse(updatedEquipment);
}

async function deleteEquipment(equipmentId) {
    await getEquipmentById(equipmentId);

    if (await requestRepository.hasOpenRequestsByEquipmentId(equipmentId)) {
        throw new ConflictError(
            'Нельзя удалить оборудование, у которого есть открытые заявки'
        );
    }

    return equipmentRepository.remove(equipmentId);
}

function validateInstalledAt(installedAt) {
    const installedDate = new Date(installedAt);
    const currentDate = new Date();

    if (installedDate > currentDate) {
        throw new ValidationError('Переданы некорректные данные', [
            {
                field: 'installedAt',
                message: 'Дата установки не может быть в будущем',
            },
        ]);
    }
}

export {
    createEquipment,
    updateEquipment,
    deleteEquipment,
    listEquipment,
    getEquipmentById,
};
