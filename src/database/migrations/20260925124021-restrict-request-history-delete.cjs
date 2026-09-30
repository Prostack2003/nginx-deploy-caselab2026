'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.removeConstraint(
                'request_status_history',
                'request_status_history_request_id_fkey',
                { transaction }
            );

            await queryInterface.addConstraint('request_status_history', {
                fields: ['request_id'],
                type: 'foreign key',
                name: 'request_status_history_request_id_fkey',
                references: {
                    table: 'maintenance_requests',
                    field: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
                transaction,
            });
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.removeConstraint(
                'request_status_history',
                'request_status_history_request_id_fkey',
                { transaction }
            );

            await queryInterface.addConstraint('request_status_history', {
                fields: ['request_id'],
                type: 'foreign key',
                name: 'request_status_history_request_id_fkey',
                references: {
                    table: 'maintenance_requests',
                    field: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                transaction,
            });
        });
    },
};
