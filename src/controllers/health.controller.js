import { sequelize } from '../database/sequelize.js';
import { ServiceUnavailableError } from '../errors/service-unavailable.error.js';

function getLiveness(request, response) {
    return response.status(200).json({
        data: {
            status: 'ok',
        },
    });
}

async function getReadiness(request, response, next) {
    try {
        await sequelize.query('SELECT 1');

        return response.status(200).json({
            data: {
                status: 'ready',
            },
        });
    } catch {
        return next(
            new ServiceUnavailableError('База данных временно недоступна')
        );
    }
}

export { getLiveness, getReadiness };
