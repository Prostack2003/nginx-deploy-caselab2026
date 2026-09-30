import { QueryTypes } from 'sequelize';
import { databaseConfig } from '../../config.js';
import { sequelize } from '../../database/sequelize.js';

function assertTestDatabase() {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error(
            'Операции с тестовой базой разрешены только при NODE_ENV=test'
        );
    }

    if (!databaseConfig.database.endsWith('_test')) {
        throw new Error('Имя тестовой базы должно оканчиваться на "_test"');
    }
}

async function connectTestDatabase() {
    assertTestDatabase();
    await sequelize.authenticate();
}

async function truncateTestDatabase() {
    assertTestDatabase();

    const tables = await sequelize.query(
        `
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
              AND tablename NOT IN ('SequelizeMeta', 'SequelizeData')
        `,
        {
            type: QueryTypes.SELECT,
        }
    );

    if (tables.length === 0) {
        return;
    }

    const queryGenerator = sequelize.getQueryInterface().queryGenerator;

    const tableNames = tables
        .map(({ tablename }) => queryGenerator.quoteTable(tablename))
        .join(', ');

    await sequelize.query(
        `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`
    );
}

async function disconnectTestDatabase() {
    await sequelize.close();
}

export {
    assertTestDatabase,
    connectTestDatabase,
    truncateTestDatabase,
    disconnectTestDatabase,
};
