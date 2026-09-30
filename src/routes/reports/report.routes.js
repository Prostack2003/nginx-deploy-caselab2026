import { Router } from 'express';
import { getEquipmentLoad } from '../../controllers/report.controller.js';
import { validateEquipmentLoadReportQuery } from '../../middlewares/validate.middleware.js';

const reportRouter = Router();

reportRouter.get(
    '/reports/equipment-load',
    validateEquipmentLoadReportQuery,
    getEquipmentLoad
);

export { reportRouter };
