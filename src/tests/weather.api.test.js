import test from 'node:test';
import assert from 'node:assert/strict';
import { buildForecastUrl, buildGeocodingUrl } from '../api/weather.api.js';

test('формируем URL для геокодирования города', () => {
    const geocodingUrl = buildGeocodingUrl('Москва');
    const encodedGeocodingUrl = new URL(geocodingUrl);

    assert.equal(encodedGeocodingUrl.pathname, '/v1/search');
    assert.equal(encodedGeocodingUrl.searchParams.get('name'), 'Москва');
    assert.equal(encodedGeocodingUrl.searchParams.get('count'), '1');
    assert.equal(encodedGeocodingUrl.searchParams.get('language'), 'ru');
    assert.equal(encodedGeocodingUrl.searchParams.get('format'), 'json');
});

test('формируем URL для прогноза погоды', () => {
    const forecastUrl = buildForecastUrl(55.75, 37.62, 3);
    const encodedForecastUrl = new URL(forecastUrl);

    assert.equal(encodedForecastUrl.pathname, '/v1/forecast');
    assert.equal(encodedForecastUrl.searchParams.get('latitude'), '55.75');
    assert.equal(encodedForecastUrl.searchParams.get('longitude'), '37.62');
    assert.equal(encodedForecastUrl.searchParams.get('forecast_days'), '3');
    assert.equal(encodedForecastUrl.searchParams.get('timezone'), 'auto');
    assert.equal(
        encodedForecastUrl.searchParams.get('temperature_unit'),
        'celsius'
    );
    assert.equal(
        encodedForecastUrl.searchParams.get('precipitation_unit'),
        'mm'
    );
    assert.equal(
        encodedForecastUrl.searchParams.get('daily'),
        'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max'
    );
    assert.equal(encodedForecastUrl.searchParams.get('wind_speed_unit'), 'kmh');
});
