import { Router } from 'express';
import { getSiteSummary } from '../../controllers/site.controller.js';
import { validateSiteIdParams } from '../../middlewares/validate.middleware.js';

const siteRouter = Router();

siteRouter.get('/sites/:id/summary', validateSiteIdParams, getSiteSummary);

export { siteRouter };
