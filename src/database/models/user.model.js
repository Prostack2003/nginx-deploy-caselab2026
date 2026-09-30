import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

class User extends Model {}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        email: {
            type: DataTypes.STRING(254),
            allowNull: false,
            set(value) {
                const normalizedEmail =
                    typeof value === 'string'
                        ? value.trim().toLowerCase()
                        : value;

                this.setDataValue('email', normalizedEmail);
            },
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('viewer', 'technician', 'admin'),
            allowNull: false,
            defaultValue: 'viewer',
        },
        technicianId: {
            type: DataTypes.UUID,
            allowNull: true,
            unique: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
        defaultScope: {
            attributes: {
                exclude: ['passwordHash'],
            },
        },
        scopes: {
            withPassword: {
                attributes: [
                    'id',
                    'email',
                    'passwordHash',
                    'role',
                    'technicianId',
                    'isActive',
                    'createdAt',
                    'updatedAt',
                ],
            },
        },
        validate: {
            roleMatchesTechnicianLink() {
                const isTechnician = this.role === 'technician';
                const hasTechnician =
                    this.technicianId !== null &&
                    this.technicianId !== undefined;

                if (isTechnician !== hasTechnician) {
                    throw new Error(
                        'Роль technician требует связь со специалистом; для остальных ролей связь запрещена'
                    );
                }
            },
        },
    }
);

export { User };
