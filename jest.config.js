export default {
    verbose: true,
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/tests/**/*.test.js'],
    transform: {},
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/tests/**',
        '!src/database/migrations/**',
        '!src/database/seeders/**',
        '!src/database/fixtures/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'html', 'lcov'],
};
