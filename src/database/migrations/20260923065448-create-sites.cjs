'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('sites', {
            id: {
                primaryKey: true,
                type: Sequelize.UUID,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            name: {
                type: Sequelize.STRING(150),
                allowNull: false,
            },
            code: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true,
            },
            region: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            latitude: {
                type: Sequelize.DECIMAL(9, 6),
                allowNull: false,
            },
            longitude: {
                type: Sequelize.DECIMAL(9, 6),
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

        await queryInterface.addConstraint('sites', {
            fields: ['latitude'],
            type: 'check',
            where: {
                latitude: {
                    [Sequelize.Op.between]: [-90, 90],
                },
            },
            name: 'sites_latitude_range_check',
        });

        await queryInterface.addConstraint('sites', {
            fields: ['longitude'],
            type: 'check',
            where: {
                longitude: {
                    [Sequelize.Op.between]: [-180, 180],
                },
            },
            name: 'sites_longitude_range_check',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('sites');
    },
};
