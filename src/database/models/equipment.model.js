import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

class Equipment extends Model {}

Equipment.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        siteId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('turbine', 'inverter', 'sensor', 'substation'),
            allowNull: false,
        },
        serialNumber: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(
                'operational',
                'maintenance',
                'fault',
                'decommissioned'
            ),
            allowNull: false,
        },
        installedAt: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Equipment',
        tableName: 'equipment',
        timestamps: true,
        underscored: true,
    }
);

export { Equipment };
