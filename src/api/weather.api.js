import {
    requestTimeoutMs,
    geocodingBaseUrl,
    forecastBaseUrl,
    temperatureUnit,
    precipitationUnit,
} from '../config.js';

async function fetchWithTimeout(url, timeoutMs = requestTimeoutMs) {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
        });
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(`Превышено время ожидания ${timeoutMs} мс`, {
                cause: error,
            });
        }

        throw new Error(
            'Не удалось выполнить запрос. Проверьте подключение к сети.',
            {
                cause: error,
            }
        );
    } finally {
        clearTimeout(timeoutId);
    }
}

function buildGeocodingUrl(city) {
    const url = new URL('/v1/search', geocodingBaseUrl);
    url.searchParams.set('name', city);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'ru');
    url.searchParams.set('format', 'json');

    return url.toString();
}

async function geocodeCity(city) {
    const url = buildGeocodingUrl(city);

    const response = await fetchWithTimeout(url);
    if (response.status >= 500) {
        throw new Error(
            `Сервис геокодинга временно недоступен: HTTP ${response.status}`
        );
    }

    if (response.status >= 400) {
        throw new Error(
            `Сервис геокодинга отклонил запрос: HTTP ${response.status}`
        );
    }

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error('Сервис геокодинга вернул некорректный JSON');
    }

    if (Array.isArray(data.results) && data.results.length > 0) {
        const location = data.results[0];

        return {
            name: location.name,
            country: location.country,
            latitude: location.latitude,
            longitude: location.longitude,
        };
    } else {
        throw new Error(`Город "${city}" не найден`);
    }
}

function buildForecastUrl(latitude, longitude, days) {
    const url = new URL('/v1/forecast', forecastBaseUrl);
    url.searchParams.set('latitude', latitude);
    url.searchParams.set('longitude', longitude);
    url.searchParams.set(
        'daily',
        'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max'
    );
    url.searchParams.set('wind_speed_unit', 'kmh');
    url.searchParams.set('forecast_days', days);
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('temperature_unit', temperatureUnit);
    url.searchParams.set('precipitation_unit', precipitationUnit);

    return url.toString();
}

async function getForecast(latitude, longitude, days) {
    const url = buildForecastUrl(latitude, longitude, days);

    const response = await fetchWithTimeout(url);

    if (response.status >= 500) {
        throw new Error(
            `Сервис прогноза временно недоступен: HTTP ${response.status}`
        );
    }

    if (response.status >= 400) {
        throw new Error(
            `Сервис прогноза отклонил запрос: HTTP ${response.status}`
        );
    }

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error('Сервис прогноза вернул некорректный JSON');
    }

    if (!data.daily || !data.daily_units) {
        throw new Error('API прогноза вернул данные неизвестного формата');
    }

    return {
        daily: data.daily,
        dailyUnits: data.daily_units,
    };
}

export { buildGeocodingUrl, geocodeCity, buildForecastUrl, getForecast };
