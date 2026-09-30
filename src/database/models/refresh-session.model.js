import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

class RefreshSession extends Model {}

RefreshSession.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        tokenHash: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        revokedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        replacedBySessionId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'RefreshSession',
        tableName: 'refresh_sessions',
        timestamps: true,
        underscored: true,
        defaultScope: {
            attributes: {
                exclude: ['tokenHash'],
            },
        },
    }
);

export { RefreshSession };
