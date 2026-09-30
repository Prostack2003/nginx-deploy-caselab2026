import * as equipmentRepository from '../repositories/equipment.repository.js';
import { getForecast } from '../api/weather.api.js';
import { NotFoundError } from '../errors/not-found.error.js';
import {
    weatherForecastDays,
    maxWindSpeedKmh,
    maxPrecipitationMm,
} from '../config.js';
import { ExternalServiceError } from '../errors/external-service.error.js';

async function getEquipmentWeather(equipmentId) {
    const equipment = equipmentRepository.findById(equipmentId);
    if (!equipment) {
        throw new NotFoundError(
            `Оборудование с идентификатором ${equipmentId} не найдено`
        );
    }

    const latitude = equipment.location.lat;
    const longitude = equipment.location.lon;
    let forecast;

    try {
        forecast = await getForecast(latitude, longitude, weatherForecastDays);
    } catch {
        throw new ExternalServiceError(
            'Сервис прогноза погоды временно недоступен'
        );
    }

    const dailyForecast = forecast.daily.time.map((date, index) => {
        const temperatureMax = forecast.daily.temperature_2m_max[index];
        const temperatureMin = forecast.daily.temperature_2m_min[index];
        const precipitationMm = forecast.daily.precipitation_sum[index];
        const dailyMaxWindSpeedKmh = forecast.daily.wind_speed_10m_max[index];

        const isSuitable =
            precipitationMm <= maxPrecipitationMm &&
            dailyMaxWindSpeedKmh <= maxWindSpeedKmh;

        return {
            date,
            temperatureMax,
            temperatureMin,
            precipitationMm,
            maxWindSpeedKmh: dailyMaxWindSpeedKmh,
            isSuitable,
        };
    });

    const isSuitable = dailyForecast.every((day) => day.isSuitable);

    return {
        equipmentId: equipmentId,
        location: {
            lat: latitude,
            lon: longitude,
        },
        forecast: {
            isSuitable,
            criteria: {
                maxWindSpeedKmh,
                maxPrecipitationMm,
            },
            daily: dailyForecast,
            dailyUnits: forecast.dailyUnits,
        },
    };
}

export { getEquipmentWeather };
