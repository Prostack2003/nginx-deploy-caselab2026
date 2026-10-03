'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.removeConstraint(
            'request_assignees',
            'request_assignees_technician_id_fkey'
        );

        await queryInterface.addConstraint('request_assignees', {
            fields: ['technician_id'],
            type: 'foreign key',
            references: {
                table: 'technicians',
                field: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            name: 'request_assignees_technician_id_fkey',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint(
            'request_assignees',
            'request_assignees_technician_id_fkey'
        );

        await queryInterface.addConstraint('request_assignees', {
            fields: ['technician_id'],
            type: 'foreign key',
            references: {
                table: 'technicians',
                field: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            name: 'request_assignees_technician_id_fkey',
        });
    },
};
