import dotenv from 'dotenv';
import process from 'node:process';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({ path: envFile, quiet: true });

const databaseConfig = {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? 'caselab',
    username: process.env.DB_USER ?? 'caselab',
    password: process.env.DB_PASSWORD,
    pool: {
        min: Number(process.env.DB_POOL_MIN ?? 0),
        max: Number(process.env.DB_POOL_MAX ?? 10),
        idle: Number(process.env.DB_POOL_IDLE_MS ?? 10000),
        acquire: Number(process.env.DB_POOL_ACQUIRE_MS ?? 30000),
    },
};

const DEFAULT_PORT = 3000;
const DEFAULT_NODE_ENV = 'development';

const port = Number(process.env.PORT ?? DEFAULT_PORT);
const nodeEnv = process.env.NODE_ENV ?? DEFAULT_NODE_ENV;

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_GEOCODING_URL = 'https://geocoding-api.open-meteo.com';
const DEFAULT_FORECAST_URL = 'https://api.open-meteo.com';

const DEFAULT_MAX_WIND_SPEED_KMH = 20;
const DEFAULT_MAX_PRECIPITATION_MM = 0;

const DEFAULT_FORECAST_DAYS = 3;

const requestTimeoutMs = Number(
    process.env.REQUEST_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS
);
const geocodingBaseUrl =
    process.env.GEOCODING_BASE_URL ?? DEFAULT_GEOCODING_URL;
const forecastBaseUrl = process.env.FORECAST_BASE_URL ?? DEFAULT_FORECAST_URL;
const temperatureUnit = process.env.TEMPERATURE_UNIT ?? 'celsius';
const precipitationUnit = process.env.PRECIPITATION_UNIT ?? 'mm';

const maxWindSpeedKmh = Number(
    process.env.MAX_WIND_SPEED_KMH ?? DEFAULT_MAX_WIND_SPEED_KMH
);

const maxPrecipitationMm = Number(
    process.env.MAX_PRECIPITATION_MM ?? DEFAULT_MAX_PRECIPITATION_MM
);

const weatherForecastDays = Number(
    process.env.WEATHER_FORECAST_DAYS ?? DEFAULT_FORECAST_DAYS
);

const logLevel = process.env.LOG_LEVEL ?? 'info';

const jsonBodyLimit = process.env.JSON_BODY_LIMIT ?? '100kb';

const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 100);

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;

if (!jwtAccessSecret || jwtAccessSecret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET должен содержать не менее 32 символов');
}

const accessTokenTtl = process.env.ACCESS_TOKEN_TTL ?? '15m';

const refreshTokenTtlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7);

const refreshCookieName = process.env.REFRESH_COOKIE_NAME ?? 'refreshToken';

const bcryptRounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

const loginRateLimitWindowMs = Number(
    process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? 900000
);

const loginRateLimitMax = Number(process.env.LOGIN_RATE_LIMIT_MAX ?? 5);

const shutdownTimeoutMs = Number(process.env.SHUTDOWN_TIMEOUT_MS ?? 10000);

export {
    port,
    nodeEnv,
    databaseConfig,
    requestTimeoutMs,
    geocodingBaseUrl,
    forecastBaseUrl,
    temperatureUnit,
    precipitationUnit,
    maxWindSpeedKmh,
    maxPrecipitationMm,
    weatherForecastDays,
    logLevel,
    jsonBodyLimit,
    corsOrigins,
    rateLimitWindowMs,
    rateLimitMax,
    jwtAccessSecret,
    accessTokenTtl,
    refreshTokenTtlDays,
    refreshCookieName,
    bcryptRounds,
    loginRateLimitWindowMs,
    loginRateLimitMax,
    shutdownTimeoutMs,
};
