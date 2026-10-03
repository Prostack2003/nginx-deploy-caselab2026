import { Router } from 'express';
import {
    createEquipment,
    updateEquipment,
    deleteEquipment,
    listEquipment,
    getEquipmentById,
} from '../../controllers/equipment.controller.js';
import { getEquipmentWeather } from '../../controllers/weather.controller.js';
import { listRequestsByEquipmentId } from '../../controllers/request.controller.js';
import {
    validateCreateEquipmentBody,
    validateUpdateEquipmentBody,
    validateEquipmentIdParams,
    validateEquipmentQuery,
    validateRequestQuery,
} from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';
import { allowAdmin, allowDomainRead } from '../../auth/role-policies.js';

const equipmentRouter = Router();

equipmentRouter.get(
    '/equipment',
    authenticate,
    allowDomainRead,
    validateEquipmentQuery,
    listEquipment
);

equipmentRouter.get(
    '/equipment/:id/requests',
    authenticate,
    allowDomainRead,
    validateEquipmentIdParams,
    validateRequestQuery,
    listRequestsByEquipmentId
);

equipmentRouter.get(
    '/equipment/:id/weather',
    authenticate,
    allowDomainRead,
    validateEquipmentIdParams,
    getEquipmentWeather
);

equipmentRouter.post(
    '/equipment',
    authenticate,
    allowAdmin,
    validateCreateEquipmentBody,
    createEquipment
);

equipmentRouter.get(
    '/equipment/:id',
    authenticate,
    allowDomainRead,
    validateEquipmentIdParams,
    getEquipmentById
);

equipmentRouter.patch(
    '/equipment/:id',
    authenticate,
    allowAdmin,
    validateEquipmentIdParams,
    validateUpdateEquipmentBody,
    updateEquipment
);

equipmentRouter.delete(
    '/equipment/:id',
    authenticate,
    allowAdmin,
    validateEquipmentIdParams,
    deleteEquipment
);

export { equipmentRouter };
