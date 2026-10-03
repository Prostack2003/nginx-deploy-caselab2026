import { Router } from 'express';
import { getEquipmentLoad } from '../../controllers/report.controller.js';
import { validateEquipmentLoadReportQuery } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';
import { allowDomainRead } from '../../auth/role-policies.js';

const reportRouter = Router();

reportRouter.get(
    '/reports/equipment-load',
    authenticate,
    allowDomainRead,
    validateEquipmentLoadReportQuery,
    getEquipmentLoad
);

export { reportRouter };
