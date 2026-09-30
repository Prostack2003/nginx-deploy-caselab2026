const path = require('node:path');

module.exports = {
    config: path.resolve('src/database/migration-config.cjs'),
    'migrations-path': path.resolve('src/database/migrations'),
    'models-path': path.resolve('src/database/models'),
    'seeders-path': path.resolve('src/database/seeders'),
};
