import { sequelize } from '../database/sequelize.js';
import { ConflictError } from '../errors/conflict.error.js';
import { NotFoundError } from '../errors/not-found.error.js';
import { ValidationError } from '../errors/validation.error.js';
import * as technicianRepository from '../repositories/technician.repository.js';
import * as userRepository from '../repositories/user.repository.js';

function validateRoleAndTechnician(role, technicianId) {
    if (role === 'technician' && technicianId === null) {
        throw new ValidationError('Переданы некорректные данные доступа', [
            {
                field: 'technicianId',
                message: 'Для роли technician необходимо выбрать специалиста',
            },
        ]);
    }

    if (role !== 'technician' && technicianId !== null) {
        throw new ValidationError('Переданы некорректные данные доступа', [
            {
                field: 'technicianId',
                message:
                    'Связь со специалистом разрешена только для роли technician',
            },
        ]);
    }
}

async function listUsers(query = {}) {
    const { rows, count } = await userRepository.findAll(query);

    return {
        items: rows,
        meta: {
            total: count,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        },
    };
}

async function updateUserAccess(userId, changes) {
    return sequelize.transaction(async (transaction) => {
        const activeAdmins =
            await userRepository.findActiveAdminsForUpdate(transaction);
        const user = await userRepository.findByIdForUpdate(
            userId,
            transaction
        );

        if (user === null) {
            throw new NotFoundError(
                `Пользователь с идентификатором "${userId}" не найден`
            );
        }

        const nextRole = changes.role ?? user.role;
        const nextIsActive = changes.isActive ?? user.isActive;
        const nextTechnicianId =
            changes.technicianId !== undefined
                ? changes.technicianId
                : user.technicianId;

        validateRoleAndTechnician(nextRole, nextTechnicianId);

        if (nextTechnicianId !== null) {
            const technician = await technicianRepository.findById(
                nextTechnicianId,
                { transaction }
            );

            if (technician === null) {
                throw new NotFoundError(
                    `Специалист с идентификатором "${nextTechnicianId}" не найден`
                );
            }
        }

        const removesActiveAdmin =
            user.role === 'admin' &&
            user.isActive &&
            (nextRole !== 'admin' || !nextIsActive);

        if (removesActiveAdmin && activeAdmins.length === 1) {
            throw new ConflictError(
                'Нельзя отключить или понизить последнего активного администратора'
            );
        }

        return userRepository.updateAccess(
            user,
            {
                role: nextRole,
                technicianId: nextTechnicianId,
                isActive: nextIsActive,
            },
            transaction
        );
    });
}

export { listUsers, updateUserAccess };
