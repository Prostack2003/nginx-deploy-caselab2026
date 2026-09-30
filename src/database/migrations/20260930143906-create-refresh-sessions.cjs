'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('refresh_sessions', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            token_hash: {
                type: Sequelize.STRING(64),
                allowNull: false,
                unique: true,
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            revoked_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            replaced_by_session_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'refresh_sessions',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
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

        await queryInterface.addIndex('refresh_sessions', {
            fields: ['user_id'],
            name: 'refresh_sessions_user_id_index',
        });

        await queryInterface.addIndex('refresh_sessions', {
            fields: ['expires_at'],
            name: 'refresh_sessions_expires_at_index',
        });

        await queryInterface.addIndex('refresh_sessions', {
            fields: ['user_id', 'revoked_at'],
            name: 'refresh_sessions_user_revoked_index',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('refresh_sessions');
    },
};
