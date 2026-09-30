import { Op } from 'sequelize';
import {
    Equipment,
    MaintenanceRequest,
    RequestAssignee,
    Technician,
    RequestStatusHistory,
} from '../database/models/index.js';
import { sequelize } from '../database/sequelize.js';

const REQUEST_SORT_FIELDS = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    plannedAt: 'plannedAt',
    priority: 'priority',
    status: 'status',
};

async function create(requestData) {
    const maintenanceRequest = await MaintenanceRequest.create({
        id: requestData.id,
        equipmentId: requestData.equipmentId,
        title: requestData.title,
        description: requestData.description ?? null,
        priority: requestData.priority,
        status: requestData.status ?? 'new',
        plannedAt: requestData.plannedAt ?? null,
        author: requestData.author ?? 'system',
    });

    return findById(maintenanceRequest.id);
}

async function findAll(query = {}) {
    const where = {};

    if (query.equipmentId) {
        where.equipmentId = query.equipmentId;
    }

    if (query.status) {
        where.status = query.status;
    }

    if (query.priority) {
        where.priority = query.priority;
    }

    if (query.createdFrom || query.createdTo) {
        where.createdAt = {};

        if (query.createdFrom) {
            where.createdAt[Op.gte] = query.createdFrom;
        }

        if (query.createdTo) {
            where.createdAt[Op.lte] = query.createdTo;
        }
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const sortField = REQUEST_SORT_FIELDS[query.sortBy] ?? 'createdAt';
    const sortDirection = query.order === 'desc' ? 'DESC' : 'ASC';

    const { rows, count } = await MaintenanceRequest.findAndCountAll({
        where,
        attributes: [
            'id',
            'equipmentId',
            'title',
            'description',
            'priority',
            'status',
            'plannedAt',
            'author',
            'createdAt',
            'updatedAt',
        ],
        include: [
            {
                model: Equipment,
                as: 'equipment',
                attributes: [
                    'id',
                    'name',
                    'type',
                    'serialNumber',
                    'status',
                    'installedAt',
                ],
            },
            {
                model: RequestAssignee,
                as: 'assignees',
                attributes: ['role', 'hours'],
                required: false,
                include: [
                    {
                        model: Technician,
                        as: 'technician',
                        attributes: [
                            'id',
                            'fullName',
                            'specialization',
                            'employeeNumber',
                        ],
                    },
                ],
            },
        ],
        order: [[sortField, sortDirection]],
        limit,
        offset,
        distinct: true,
    });

    return {
        rows: rows.map((request) => request.get({ plain: true })),
        count,
    };
}

async function findById(id) {
    const maintenanceRequest = await MaintenanceRequest.findByPk(id, {
        attributes: [
            'id',
            'equipmentId',
            'title',
            'description',
            'priority',
            'status',
            'plannedAt',
            'author',
            'createdAt',
            'updatedAt',
        ],
        include: [
            {
                model: Equipment,
                as: 'equipment',
                attributes: [
                    'id',
                    'name',
                    'type',
                    'serialNumber',
                    'status',
                    'installedAt',
                ],
            },
            {
                model: RequestAssignee,
                as: 'assignees',
                attributes: ['role', 'hours'],
                required: false,
                include: [
                    {
                        model: Technician,
                        as: 'technician',
                        attributes: [
                            'id',
                            'fullName',
                            'specialization',
                            'employeeNumber',
                        ],
                    },
                ],
            },
        ],
    });

    if (maintenanceRequest === null) {
        return null;
    }

    return maintenanceRequest.get({ plain: true });
}

async function update(id, changes) {
    const [updatedCount] = await MaintenanceRequest.update(changes, {
        where: {
            id,
        },
    });

    if (updatedCount === 0) {
        return null;
    }

    return findById(id);
}

async function changeStatus(id, newStatus, validateChange) {
    const requestExists = await sequelize.transaction(async (transaction) => {
        const maintenanceRequest = await MaintenanceRequest.findByPk(id, {
            attributes: ['id', 'status'],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (maintenanceRequest === null) {
            return false;
        }

        const assigneeCount = await RequestAssignee.count({
            where: { requestId: id },
            transaction,
        });

        validateChange(maintenanceRequest.status, assigneeCount);

        const oldStatus = maintenanceRequest.status;

        await maintenanceRequest.update(
            {
                status: newStatus,
            },
            {
                transaction,
            }
        );

        await RequestStatusHistory.create(
            {
                requestId: id,
                oldStatus,
                newStatus,
            },
            {
                transaction,
            }
        );

        return true;
    });

    if (!requestExists) {
        return null;
    }

    return findById(id);
}

async function remove(id) {
    const deletedCount = await MaintenanceRequest.destroy({
        where: { id },
    });

    return deletedCount > 0;
}

async function hasOpenRequestsByEquipmentId(equipmentId) {
    const openRequestsCount = await MaintenanceRequest.count({
        where: {
            equipmentId,
            status: {
                [Op.in]: ['new', 'in_progress'],
            },
        },
    });

    return openRequestsCount > 0;
}

async function existsById(id) {
    const maintenanceRequest = await MaintenanceRequest.findByPk(id, {
        attributes: ['id'],
    });

    return maintenanceRequest !== null;
}

export {
    create,
    findAll,
    findById,
    update,
    changeStatus,
    remove,
    hasOpenRequestsByEquipmentId,
    existsById,
};
