module.exports = async () => {
    const { databaseConfig } = await import('../config.js');

    if (!databaseConfig.password) {
        throw new Error('Переменная окружения DB_PASSWORD не задана');
    }

    const createConfig = () => ({
        dialect: 'postgres',
        ...databaseConfig,
        logging: false,
        seederStorage: 'sequelize',
        seederStorageTableName: 'SequelizeData',
    });

    return {
        development: createConfig(),
        test: createConfig(),
    };
};
