import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

class Site extends Model {}

Site.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        region: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        latitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: false,
            validate: {
                min: -90,
                max: 90,
            },
        },
        longitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: false,
            validate: {
                min: -180,
                max: 180,
            },
        },
    },
    {
        sequelize,
        modelName: 'Site',
        tableName: 'sites',
        timestamps: true,
        underscored: true,
    }
);

export { Site };
