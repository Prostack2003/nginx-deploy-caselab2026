import { randomUUID } from 'node:crypto';
import * as requestRepository from '../repositories/request.repository.js';
import * as equipmentRepository from '../repositories/equipment.repository.js';
import { NotFoundError } from '../errors/not-found.error.js';
import { ValidationError } from '../errors/validation.error.js';
import { ConflictError } from '../errors/conflict.error.js';

const ALLOWED_STATUS_TRANSITIONS = {
    new: ['in_progress', 'rejected'],
    in_progress: ['done', 'rejected'],
    done: [],
    rejected: [],
};

async function createRequest(data) {
    const equipment = await equipmentRepository.findById(data.equipmentId);

    if (equipment === null) {
        throw new NotFoundError('Такого оборудования не существует');
    }

    const requestObject = {
        id: randomUUID(),
        equipmentId: data.equipmentId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'new',
        plannedAt: data.plannedAt,
        author: 'system',
    };

    const createdRequest = await requestRepository.create(requestObject);

    return mapRequestToResponse(createdRequest);
}

async function updateRequest(requestId, changes) {
    await getRequestById(requestId);

    if (Object.keys(changes).length === 0) {
        throw new ValidationError('Переданы некорректные данные', [
            {
                field: 'body',
                message: 'Укажите хотя бы одно поле для обновления',
            },
        ]);
    }

    if (changes.equipmentId !== undefined) {
        const equipment = await equipmentRepository.findById(
            changes.equipmentId
        );

        if (equipment === null) {
            throw new NotFoundError(
                `Оборудование с идентификатором "${changes.equipmentId}" не найдено`
            );
        }
    }

    const allowedChanges = {};

    if (changes.equipmentId !== undefined) {
        allowedChanges.equipmentId = changes.equipmentId;
    }

    if (changes.title !== undefined) {
        allowedChanges.title = changes.title;
    }

    if (changes.description !== undefined) {
        allowedChanges.description = changes.description;
    }

    if (changes.priority !== undefined) {
        allowedChanges.priority = changes.priority;
    }

    if (changes.plannedAt !== undefined) {
        allowedChanges.plannedAt = changes.plannedAt;
    }

    const updatedRequest = await requestRepository.update(
        requestId,
        allowedChanges
    );

    return mapRequestToResponse(updatedRequest);
}

async function deleteRequest(requestId) {
    await getRequestById(requestId);
    return requestRepository.remove(requestId);
}

async function getRequestById(requestId) {
    const maintenanceRequest = await requestRepository.findById(requestId);

    if (maintenanceRequest === null) {
        throw new NotFoundError(
            `Заявка с идентификатором ${requestId} не найдена`
        );
    }

    return mapRequestToResponse(maintenanceRequest);
}

function mapRequestToResponse(maintenanceRequest) {
    const { assignees, ...requestData } = maintenanceRequest;

    return {
        ...requestData,
        assignees: assignees.map((assignment) => ({
            ...assignment.technician,
            role: assignment.role,
            hours: Number(assignment.hours),
        })),
    };
}

async function listRequests(query = {}) {
    const { rows, count } = await requestRepository.findAll(query);

    return {
        items: rows.map(mapRequestToResponse),
        meta: {
            total: count,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        },
    };
}

function validateStatusChange(currentStatus, newStatus, assigneeCount) {
    const allowedStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus];

    if (!allowedStatuses.includes(newStatus)) {
        throw new ConflictError(
            `Переход статуса из "${currentStatus}" в "${newStatus}" запрещён`
        );
    }

    if (newStatus === 'in_progress' && assigneeCount === 0) {
        throw new ConflictError(
            'Нельзя перевести заявку в работу без назначенного техника'
        );
    }
}

async function changeRequestStatus(requestId, newStatus) {
    const updatedRequest = await requestRepository.changeStatus(
        requestId,
        newStatus,
        (currentStatus, assigneeCount) =>
            validateStatusChange(currentStatus, newStatus, assigneeCount)
    );

    if (updatedRequest === null) {
        throw new NotFoundError(
            `Заявка с идентификатором ${requestId} не найдена`
        );
    }

    return mapRequestToResponse(updatedRequest);
}

async function listRequestsByEquipmentId(equipmentId, query = {}) {
    const equipment = await equipmentRepository.findById(equipmentId);

    if (equipment === null) {
        throw new NotFoundError(
            `Оборудование с идентификатором "${equipmentId}" не найдено`
        );
    }

    return listRequests({
        ...query,
        equipmentId,
    });
}

export {
    createRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
    listRequests,
    changeRequestStatus,
    listRequestsByEquipmentId,
};
