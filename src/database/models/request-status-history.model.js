import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

class RequestStatusHistory extends Model {}

RequestStatusHistory.init(
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        requestId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        oldStatus: {
            type: DataTypes.ENUM('new', 'in_progress', 'done', 'rejected'),
            allowNull: true,
        },
        newStatus: {
            type: DataTypes.ENUM('new', 'in_progress', 'done', 'rejected'),
            allowNull: false,
        },
        changedBy: {
            type: DataTypes.STRING(150),
            allowNull: false,
            defaultValue: 'system',
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        changedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'RequestStatusHistory',
        tableName: 'request_status_history',
        timestamps: false,
        underscored: true,
    }
);

export { RequestStatusHistory };
