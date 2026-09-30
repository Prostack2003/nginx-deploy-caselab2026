import { Op, col, fn, where as sequelizeWhere } from 'sequelize';
import {
    Equipment,
    EquipmentPassport,
    Site,
} from '../database/models/index.js';
import { randomUUID } from 'node:crypto';
import { sequelize } from '../database/sequelize.js';

const EQUIPMENT_SORT_FIELDS = {
    name: 'name',
    type: 'type',
    serialNumber: 'serialNumber',
    status: 'status',
    installedAt: 'installedAt',
};

async function findOrCreateSiteByLocation(
    location,
    equipmentName,
    transaction
) {
    const existingSite = await Site.findOne({
        where: {
            latitude: location.lat,
            longitude: location.lon,
        },
        transaction,
    });

    if (existingSite !== null) {
        return existingSite;
    }

    return Site.create(
        {
            name: `Площадка оборудования «${equipmentName}»`,
            code: `AUTO-${randomUUID()}`,
            region: 'Не указан',
            latitude: location.lat,
            longitude: location.lon,
        },
        { transaction }
    );
}

async function create(equipmentData) {
    const equipmentId = await sequelize.transaction(async (transaction) => {
        const site = await findOrCreateSiteByLocation(
            equipmentData.location,
            equipmentData.name,
            transaction
        );

        const equipment = await Equipment.create(
            {
                id: equipmentData.id,
                siteId: site.id,
                name: equipmentData.name,
                type: equipmentData.type,
                serialNumber: equipmentData.serialNumber,
                status: equipmentData.status,
                installedAt: equipmentData.installedAt,
            },
            { transaction }
        );

        return equipment.id;
    });

    return findById(equipmentId);
}

async function update(equipmentId, equipmentChanges) {
    const updated = await sequelize.transaction(async (transaction) => {
        const equipment = await Equipment.findByPk(equipmentId, {
            transaction,
        });

        if (equipment === null) {
            return false;
        }

        const changes = {};

        if (equipmentChanges.name !== undefined) {
            changes.name = equipmentChanges.name;
        }

        if (equipmentChanges.type !== undefined) {
            changes.type = equipmentChanges.type;
        }

        if (equipmentChanges.serialNumber !== undefined) {
            changes.serialNumber = equipmentChanges.serialNumber;
        }

        if (equipmentChanges.status !== undefined) {
            changes.status = equipmentChanges.status;
        }

        if (equipmentChanges.installedAt !== undefined) {
            changes.installedAt = equipmentChanges.installedAt;
        }

        if (equipmentChanges.location !== undefined) {
            const site = await findOrCreateSiteByLocation(
                equipmentChanges.location,
                equipmentChanges.name ?? equipment.name,
                transaction
            );

            changes.siteId = site.id;
        }

        await equipment.update(changes, { transaction });

        return true;
    });

    if (!updated) {
        return null;
    }

    return findById(equipmentId);
}

async function remove(equipmentId) {
    const deletedCount = await Equipment.destroy({
        where: {
            id: equipmentId,
        },
    });

    return deletedCount > 0;
}

async function findAll(query = {}) {
    const where = {};

    if (query.type) {
        where.type = query.type;
    }

    if (query.status) {
        where.status = query.status;
    }

    if (query.installedFrom || query.installedTo) {
        where.installedAt = {};

        if (query.installedFrom) {
            where.installedAt[Op.gte] = query.installedFrom;
        }

        if (query.installedTo) {
            where.installedAt[Op.lte] = query.installedTo;
        }
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const sortField = EQUIPMENT_SORT_FIELDS[query.sortBy] ?? 'name';
    const sortDirection = query.order === 'desc' ? 'DESC' : 'ASC';

    const { rows, count } = await Equipment.findAndCountAll({
        where,
        attributes: [
            'id',
            'siteId',
            'name',
            'type',
            'serialNumber',
            'status',
            'installedAt',
            'createdAt',
            'updatedAt',
        ],
        include: [
            {
                model: Site,
                as: 'site',
                attributes: [
                    'id',
                    'name',
                    'code',
                    'region',
                    'latitude',
                    'longitude',
                ],
            },
            {
                model: EquipmentPassport,
                as: 'passport',
                attributes: [
                    'id',
                    'manufacturer',
                    'model',
                    'ratedPower',
                    'lastCalibrationAt',
                ],
                required: false,
            },
        ],
        order: [[sortField, sortDirection]],
        limit,
        offset,
        distinct: true,
    });

    return {
        rows: rows.map((equipment) => equipment.get({ plain: true })),
        count,
    };
}

async function findById(id) {
    const equipment = await Equipment.findByPk(id, {
        attributes: [
            'id',
            'siteId',
            'name',
            'type',
            'serialNumber',
            'status',
            'installedAt',
            'createdAt',
            'updatedAt',
        ],
        include: [
            {
                model: Site,
                as: 'site',
                attributes: [
                    'id',
                    'name',
                    'code',
                    'region',
                    'latitude',
                    'longitude',
                ],
            },
            {
                model: EquipmentPassport,
                as: 'passport',
                attributes: [
                    'id',
                    'manufacturer',
                    'model',
                    'ratedPower',
                    'lastCalibrationAt',
                ],
                required: false,
            },
        ],
    });

    if (equipment === null) {
        return null;
    }

    return equipment.get({ plain: true });
}

async function findBySerialNumber(serialNumber) {
    const equipment = await Equipment.findOne({
        where: sequelizeWhere(
            fn('lower', col('serial_number')),
            serialNumber.toLowerCase()
        ),
        attributes: ['id', 'serialNumber'],
    });

    if (equipment === null) {
        return null;
    }

    return equipment.get({ plain: true });
}

export { create, update, remove, findAll, findById, findBySerialNumber };
