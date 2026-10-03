import { User } from '../database/models/index.js';

const SORT_FIELDS = {
    email: 'email',
    role: 'role',
    isActive: 'isActive',
    createdAt: 'createdAt',
};

function toPublicUser(user) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        technicianId: user.technicianId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

async function findByEmailWithPassword(email) {
    const user = await User.scope('withPassword').findOne({
        where: {
            email,
        },
    });

    return user === null ? null : user.get({ plain: true });
}

async function findById(userId, { transaction } = {}) {
    const user = await User.findByPk(userId, {
        transaction,
    });

    return user === null ? null : toPublicUser(user);
}

async function findAll({
    page = 1,
    limit = 10,
    sortBy = 'email',
    order = 'asc',
} = {}) {
    const { rows, count } = await User.findAndCountAll({
        order: [[SORT_FIELDS[sortBy], order.toUpperCase()]],
        limit,
        offset: (page - 1) * limit,
    });

    return {
        rows: rows.map(toPublicUser),
        count,
    };
}

async function findByIdForUpdate(userId, transaction) {
    return User.findByPk(userId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
    });
}

async function findActiveAdminsForUpdate(transaction) {
    return User.findAll({
        where: {
            role: 'admin',
            isActive: true,
        },
        attributes: ['id'],
        order: [['id', 'ASC']],
        transaction,
        lock: transaction.LOCK.UPDATE,
    });
}

async function updateAccess(user, changes, transaction) {
    await user.update(changes, {
        transaction,
    });

    return toPublicUser(user);
}

async function createViewer({ email, passwordHash }) {
    const user = await User.create({
        email,
        passwordHash,
        role: 'viewer',
        technicianId: null,
        isActive: true,
    });

    return toPublicUser(user);
}

export {
    findByEmailWithPassword,
    findById,
    findAll,
    findByIdForUpdate,
    findActiveAdminsForUpdate,
    updateAccess,
    createViewer,
};
