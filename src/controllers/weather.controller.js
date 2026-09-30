import * as weatherService from '../services/weather.service.js';

async function getEquipmentWeather(request, response) {
    const id = request.params.id;
    const data = await weatherService.getEquipmentWeather(id);
    return response.status(200).json({
        data: data,
    });
}

export { getEquipmentWeather };
