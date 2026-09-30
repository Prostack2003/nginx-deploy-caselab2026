module.exports = async () => {
    const { databaseConfig } = await import('../config.js');
    if (!databaseConfig.password) {
        throw new Error('Переменная окружения DB_PASSWORD не задана');
    }

    return {
        development: {
            dialect: 'postgres',
            ...databaseConfig,
            logging: false,
            seederStorage: 'sequelize',
            seederStorageTableName: 'SequelizeData',
        },
    };
};
