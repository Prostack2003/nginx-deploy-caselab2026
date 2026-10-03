import { Router } from 'express';
import { getSiteSummary } from '../../controllers/site.controller.js';
import { validateSiteIdParams } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';
import { allowDomainRead } from '../../auth/role-policies.js';

const siteRouter = Router();

siteRouter.get(
    '/sites/:id/summary',
    authenticate,
    allowDomainRead,
    validateSiteIdParams,
    getSiteSummary
);

export { siteRouter };
