import { User } from '../database/models/index.js';

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

export { findByEmailWithPassword, findById, createViewer };
