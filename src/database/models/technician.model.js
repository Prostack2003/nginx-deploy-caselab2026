import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

class Technician extends Model {}

Technician.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        fullName: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        specialization: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        employeeNumber: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Technician',
        tableName: 'technicians',
        timestamps: true,
        underscored: true,
    }
);

export { Technician };
