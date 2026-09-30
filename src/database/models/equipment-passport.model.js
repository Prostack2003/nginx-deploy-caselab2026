import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

class EquipmentPassport extends Model {}

EquipmentPassport.init(
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
            unique: true,
        },
        manufacturer: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        model: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        ratedPower: {
            type: DataTypes.DECIMAL(12, 3),
            allowNull: false,
            validate: {
                min: 0.001,
            },
        },
        lastCalibrationAt: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'EquipmentPassport',
        tableName: 'equipment_passports',
        timestamps: true,
        underscored: true,
    }
);

export { EquipmentPassport };
