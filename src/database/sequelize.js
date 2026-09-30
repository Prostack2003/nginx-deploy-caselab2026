import { Sequelize } from 'sequelize';
import { databaseConfig } from '../config.js';

const sequelize = new Sequelize({
    dialect: 'postgres',
    ...databaseConfig,
    logging: false,
});

async function connectDatabase() {
    if (!databaseConfig.password) {
        throw new Error('Переменная окружения DB_PASSWORD не задана');
    }

    await sequelize.authenticate();
}

async function disconnectDatabase() {
    await sequelize.close();
}

export { sequelize, connectDatabase, disconnectDatabase };
