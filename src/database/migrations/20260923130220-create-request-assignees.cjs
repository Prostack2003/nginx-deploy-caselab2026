'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('request_assignees', {
            request_id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'maintenance_requests',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            technician_id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'technicians',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            role: {
                type: Sequelize.ENUM('lead', 'member'),
                allowNull: false,
            },
            hours: {
                type: Sequelize.DECIMAL(6, 2),
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.addConstraint('request_assignees', {
            fields: ['hours'],
            type: 'check',
            where: {
                hours: {
                    [Sequelize.Op.gt]: 0,
                },
            },
            name: 'request_assignees_hours_positive_check',
        });

        await queryInterface.addIndex('request_assignees', {
            fields: ['request_id'],
            unique: true,
            where: {
                role: 'lead',
            },
            name: 'request_assignees_one_lead_per_request_unique',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('request_assignees');

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_request_assignees_role"'
        );
    },
};
