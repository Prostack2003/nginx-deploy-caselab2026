'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            email: {
                type: Sequelize.STRING(254),
                allowNull: false,
            },
            password_hash: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            role: {
                type: Sequelize.ENUM('viewer', 'technician', 'admin'),
                allowNull: false,
                defaultValue: 'viewer',
            },
            technician_id: {
                type: Sequelize.UUID,
                allowNull: true,
                unique: true,
                references: {
                    model: 'technicians',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
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

        await queryInterface.addIndex('users', {
            fields: [Sequelize.fn('lower', Sequelize.col('email'))],
            unique: true,
            name: 'users_email_lower_unique',
        });

        await queryInterface.addIndex('users', {
            fields: ['role'],
            name: 'users_role_index',
        });

        await queryInterface.sequelize.query(`
            ALTER TABLE users
            ADD CONSTRAINT users_role_technician_link_check
            CHECK (
                (
                    role = 'technician'
                    AND technician_id IS NOT NULL
                )
                OR
                (
                    role IN ('viewer', 'admin')
                    AND technician_id IS NULL
                )
            )
        `);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('users');

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_users_role"'
        );
    },
};
