'use strict';

const {
    maintenanceRequests,
    requestStatusHistory,
    requestAssignees,
} = require('../fixtures/request-demo/index.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkInsert(
                'maintenance_requests',
                maintenanceRequests,
                { transaction }
            );

            await queryInterface.bulkInsert(
                'request_status_history',
                requestStatusHistory,
                { transaction }
            );

            await queryInterface.bulkInsert(
                'request_assignees',
                requestAssignees,
                { transaction }
            );
        });
    },

    async down(queryInterface) {
        const requestIds = maintenanceRequests.map((request) => request.id);

        const historyIds = requestStatusHistory.map(
            (historyItem) => historyItem.id
        );

        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.bulkDelete(
                'request_assignees',
                { request_id: requestIds },
                { transaction }
            );

            await queryInterface.bulkDelete(
                'request_status_history',
                { id: historyIds },
                { transaction }
            );

            await queryInterface.bulkDelete(
                'maintenance_requests',
                { id: requestIds },
                { transaction }
            );
        });
    },
};
