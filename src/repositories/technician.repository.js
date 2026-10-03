import { Technician } from '../database/models/index.js';

const TECHNICIAN_ATTRIBUTES = [
    'id',
    'fullName',
    'specialization',
    'employeeNumber',
    'createdAt',
    'updatedAt',
];

const TECHNICIAN_SORT_FIELDS = {
    fullName: 'fullName',
    specialization: 'specialization',
    employeeNumber: 'employeeNumber',
};

async function create(data) {
    const technician = await Technician.create({
        fullName: data.fullName,
        specialization: data.specialization,
        employeeNumber: data.employeeNumber,
    });

    return technician.get({ plain: true });
}

async function findAll(query = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const sortField = TECHNICIAN_SORT_FIELDS[query.sortBy] ?? 'fullName';
    const sortDirection = query.order === 'desc' ? 'DESC' : 'ASC';

    const { rows, count } = await Technician.findAndCountAll({
        attributes: TECHNICIAN_ATTRIBUTES,
        order: [[sortField, sortDirection]],
        limit,
        offset,
    });

    return {
        rows: rows.map((technician) => technician.get({ plain: true })),
        count,
    };
}

async function findById(technicianId, { transaction } = {}) {
    const technician = await Technician.findByPk(technicianId, {
        attributes: TECHNICIAN_ATTRIBUTES,
        transaction,
    });

    return technician === null ? null : technician.get({ plain: true });
}

async function update(technicianId, changes) {
    const technician = await Technician.findByPk(technicianId);

    if (technician === null) {
        return null;
    }

    await technician.update(changes);

    return technician.get({ plain: true });
}

async function remove(technicianId) {
    const deletedCount = await Technician.destroy({
        where: {
            id: technicianId,
        },
    });

    return deletedCount > 0;
}

export { create, findAll, findById, update, remove };
