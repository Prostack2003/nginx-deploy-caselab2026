import { Router } from 'express';
import {
    createTechnician,
    listTechnicians,
    getTechnicianById,
    updateTechnician,
    deleteTechnician,
} from '../../controllers/technician.controller.js';
import {
    validateTechnicianIdParams,
    validateCreateTechnicianBody,
    validateUpdateTechnicianBody,
    validateTechnicianQuery,
} from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';
import { allowAdmin, allowDomainRead } from '../../auth/role-policies.js';

const technicianRouter = Router();

technicianRouter.get(
    '/technicians',
    authenticate,
    allowDomainRead,
    validateTechnicianQuery,
    listTechnicians
);

technicianRouter.post(
    '/technicians',
    authenticate,
    allowAdmin,
    validateCreateTechnicianBody,
    createTechnician
);

technicianRouter.get(
    '/technicians/:id',
    authenticate,
    allowDomainRead,
    validateTechnicianIdParams,
    getTechnicianById
);

technicianRouter.patch(
    '/technicians/:id',
    authenticate,
    allowAdmin,
    validateTechnicianIdParams,
    validateUpdateTechnicianBody,
    updateTechnician
);

technicianRouter.delete(
    '/technicians/:id',
    authenticate,
    allowAdmin,
    validateTechnicianIdParams,
    deleteTechnician
);

export { technicianRouter };
