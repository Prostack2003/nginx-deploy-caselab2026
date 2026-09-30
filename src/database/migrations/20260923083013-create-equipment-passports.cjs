'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('equipment_passports', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            equipment_id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                references: {
                    model: 'equipment',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            manufacturer: {
                type: Sequelize.STRING(150),
                allowNull: false,
            },
            model: {
                type: Sequelize.STRING(150),
                allowNull: false,
            },
            rated_power: {
                type: Sequelize.DECIMAL(12, 3),
                allowNull: false,
            },
            last_calibration_at: {
                type: Sequelize.DATEONLY,
                allowNull: true,
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

        await queryInterface.addConstraint('equipment_passports', {
            fields: ['rated_power'],
            type: 'check',
            where: {
                rated_power: {
                    [Sequelize.Op.gt]: 0,
                },
            },
            name: 'equipment_passports_rated_power_positive_check',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('equipment_passports');
    },
};
