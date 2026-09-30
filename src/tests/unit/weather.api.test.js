import { buildForecastUrl, buildGeocodingUrl } from '../../api/weather.api.js';

describe('Open-Meteo URL builder', () => {
    test('формирует URL для геокодирования города', () => {
        const geocodingUrl = buildGeocodingUrl('Москва');
        const encodedGeocodingUrl = new URL(geocodingUrl);

        expect(encodedGeocodingUrl.pathname).toBe('/v1/search');
        expect(encodedGeocodingUrl.searchParams.get('name')).toBe('Москва');
        expect(encodedGeocodingUrl.searchParams.get('count')).toBe('1');
        expect(encodedGeocodingUrl.searchParams.get('language')).toBe('ru');
        expect(encodedGeocodingUrl.searchParams.get('format')).toBe('json');
    });

    test('формирует URL для прогноза погоды', () => {
        const forecastUrl = buildForecastUrl(55.75, 37.62, 3);
        const encodedForecastUrl = new URL(forecastUrl);

        expect(encodedForecastUrl.pathname).toBe('/v1/forecast');
        expect(encodedForecastUrl.searchParams.get('latitude')).toBe('55.75');
        expect(encodedForecastUrl.searchParams.get('longitude')).toBe('37.62');
        expect(encodedForecastUrl.searchParams.get('forecast_days')).toBe('3');
        expect(encodedForecastUrl.searchParams.get('timezone')).toBe('auto');
        expect(encodedForecastUrl.searchParams.get('temperature_unit')).toBe(
            'celsius'
        );
        expect(encodedForecastUrl.searchParams.get('precipitation_unit')).toBe(
            'mm'
        );
        expect(encodedForecastUrl.searchParams.get('daily')).toBe(
            'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max'
        );
        expect(encodedForecastUrl.searchParams.get('wind_speed_unit')).toBe(
            'kmh'
        );
    });
});
