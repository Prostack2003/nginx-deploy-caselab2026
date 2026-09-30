import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

class RequestAssignee extends Model {}

RequestAssignee.init(
    {
        requestId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        technicianId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        role: {
            type: DataTypes.ENUM('lead', 'member'),
            allowNull: false,
        },
        hours: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: false,
            validate: {
                min: 0.01,
            },
        },
    },
    {
        sequelize,
        modelName: 'RequestAssignee',
        tableName: 'request_assignees',
        timestamps: true,
        underscored: true,
    }
);

export { RequestAssignee };
