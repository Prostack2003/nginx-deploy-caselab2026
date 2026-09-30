'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('equipment', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            site_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'sites',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM(
                    'turbine',
                    'inverter',
                    'sensor',
                    'substation'
                ),
                allowNull: false,
            },
            serial_number: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM(
                    'operational',
                    'maintenance',
                    'fault',
                    'decommissioned'
                ),
                allowNull: false,
            },
            installed_at: {
                type: Sequelize.DATEONLY,
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

        await queryInterface.addIndex('equipment', {
            fields: [Sequelize.fn('lower', Sequelize.col('serial_number'))],
            unique: true,
            name: 'equipment_serial_number_lower_unique',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('equipment');

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_equipment_type";'
        );

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_equipment_status";'
        );
    },
};
