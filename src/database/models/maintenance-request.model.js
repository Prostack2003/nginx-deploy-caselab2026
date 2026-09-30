import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

class MaintenanceRequest extends Model {}

MaintenanceRequest.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        equipmentId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('new', 'in_progress', 'done', 'rejected'),
            allowNull: false,
            defaultValue: 'new',
        },
        plannedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        author: {
            type: DataTypes.STRING(150),
            allowNull: false,
            defaultValue: 'system',
        },
    },
    {
        sequelize,
        modelName: 'MaintenanceRequest',
        tableName: 'maintenance_requests',
        timestamps: true,
        underscored: true,
    }
);

export { MaintenanceRequest };
