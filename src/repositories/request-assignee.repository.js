import { Op } from 'sequelize';
import { sequelize } from '../database/sequelize.js';
import {
    MaintenanceRequest,
    RequestAssignee,
    Technician,
} from '../database/models/index.js';
import { NotFoundError } from '../errors/not-found.error.js';
import { ConflictError } from '../errors/conflict.error.js';
import { ValidationError } from '../errors/validation.error.js';

async function replaceTeam(requestId, assignees) {
    return sequelize.transaction(async (transaction) => {
        const maintenanceRequest = await MaintenanceRequest.findByPk(
            requestId,
            {
                attributes: ['id'],
                transaction,
                lock: transaction.LOCK.UPDATE,
            }
        );

        if (maintenanceRequest === null) {
            throw new NotFoundError(
                `Заявка с идентификатором "${requestId}" не найдена`
            );
        }

        const technicianIds = assignees.map(
            (assignee) => assignee.technicianId
        );

        const technicians = await Technician.findAll({
            where: {
                id: {
                    [Op.in]: technicianIds,
                },
            },
            attributes: ['id'],
            transaction,
        });

        const existingTechnicianIds = new Set(
            technicians.map((technician) => technician.id)
        );

        const missingTechnicianId = technicianIds.find(
            (technicianId) => !existingTechnicianIds.has(technicianId)
        );

        if (missingTechnicianId !== undefined) {
            throw new NotFoundError(
                `Специалист с идентификатором "${missingTechnicianId}" не найден`
            );
        }

        await RequestAssignee.destroy({
            where: {
                requestId,
            },
            transaction,
        });

        const leadCount = assignees.filter(
            (assignee) => assignee.role === 'lead'
        ).length;

        if (leadCount !== 1) {
            throw new ValidationError('Переданы некорректные данные', [
                {
                    field: 'assignees',
                    message:
                        'В бригаде должен быть ровно один ведущий специалист',
                },
            ]);
        }

        const uniqueTechnicianIds = new Set(technicianIds);

        if (uniqueTechnicianIds.size !== technicianIds.length) {
            throw new ConflictError(
                'Один специалист не может быть назначен на заявку повторно'
            );
        }

        await RequestAssignee.bulkCreate(
            assignees.map((assignee) => ({
                requestId,
                technicianId: assignee.technicianId,
                role: assignee.role,
                hours: assignee.hours,
            })),
            {
                transaction,
            }
        );

        const createdAssignments = await RequestAssignee.findAll({
            where: {
                requestId,
            },
            attributes: ['role', 'hours'],
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
            transaction,
        });

        return createdAssignments.map((assignment) =>
            assignment.get({ plain: true })
        );
    });
}

async function remove(requestId, technicianId) {
    const deletedCount = await RequestAssignee.destroy({
        where: {
            requestId,
            technicianId,
        },
    });

    return deletedCount > 0;
}

export { replaceTeam, remove };
