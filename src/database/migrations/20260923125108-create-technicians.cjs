'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('technicians', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            full_name: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            specialization: {
                type: Sequelize.STRING(150),
                allowNull: false,
            },
            employee_number: {
                type: Sequelize.STRING(50),
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
        await queryInterface.addIndex('technicians', {
            fields: [Sequelize.fn('lower', Sequelize.col('employee_number'))],
            unique: true,
            name: 'technicians_employee_number_lower_unique',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('technicians');
    },
};
