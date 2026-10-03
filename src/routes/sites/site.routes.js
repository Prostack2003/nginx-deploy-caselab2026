import { Router } from 'express';
import {
    createSite,
    listSites,
    getSiteById,
    updateSite,
    deleteSite,
    getSiteSummary,
} from '../../controllers/site.controller.js';
import {
    validateSiteIdParams,
    validateCreateSiteBody,
    validateUpdateSiteBody,
    validateSiteQuery,
} from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';
import { allowAdmin, allowDomainRead } from '../../auth/role-policies.js';

const siteRouter = Router();

siteRouter.get(
    '/sites',
    authenticate,
    allowDomainRead,
    validateSiteQuery,
    listSites
);

siteRouter.post(
    '/sites',
    authenticate,
    allowAdmin,
    validateCreateSiteBody,
    createSite
);

siteRouter.get(
    '/sites/:id/summary',
    authenticate,
    allowDomainRead,
    validateSiteIdParams,
    getSiteSummary
);

siteRouter.get(
    '/sites/:id',
    authenticate,
    allowDomainRead,
    validateSiteIdParams,
    getSiteById
);

siteRouter.patch(
    '/sites/:id',
    authenticate,
    allowAdmin,
    validateSiteIdParams,
    validateUpdateSiteBody,
    updateSite
);

siteRouter.delete(
    '/sites/:id',
    authenticate,
    allowAdmin,
    validateSiteIdParams,
    deleteSite
);

export { siteRouter };
