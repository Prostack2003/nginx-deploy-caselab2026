import { Router } from 'express';
import * as requestController from '../../controllers/request.controller.js';
import * as requestAssigneeController from '../../controllers/request-assignee.controller.js';
import * as requestStatusHistoryController from '../../controllers/request-status-history.controller.js';
import {
    validateRequestIdParams,
    validateCreateRequestBody,
    validateUpdateRequestBody,
    validateChangeRequestStatusBody,
    validateRequestQuery,
    validateAssignRequestTeamBody,
    validateRequestAssigneeParams,
} from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';
import {
    allowAdmin,
    allowDomainRead,
    allowTechnicianOrAdmin,
} from '../../auth/role-policies.js';
import { authorizeRequestStatusChange } from '../../middlewares/authorize-request-status.middleware.js';

const requestRouter = Router();

requestRouter.get(
    '/requests',
    authenticate,
    allowDomainRead,
    validateRequestQuery,
    requestController.listRequests
);

requestRouter.get(
    '/requests/:id',
    authenticate,
    allowDomainRead,
    validateRequestIdParams,
    requestController.getRequestById
);

requestRouter.get(
    '/requests/:id/history',
    authenticate,
    allowDomainRead,
    validateRequestIdParams,
    requestStatusHistoryController.listRequestStatusHistory
);

requestRouter.post(
    '/requests',
    authenticate,
    allowTechnicianOrAdmin,
    validateCreateRequestBody,
    requestController.createRequest
);

requestRouter.patch(
    '/requests/:id',
    authenticate,
    allowTechnicianOrAdmin,
    validateRequestIdParams,
    validateUpdateRequestBody,
    requestController.updateRequest
);

requestRouter.patch(
    '/requests/:id/status',
    authenticate,
    allowTechnicianOrAdmin,
    validateRequestIdParams,
    authorizeRequestStatusChange,
    validateChangeRequestStatusBody,
    requestController.changeRequestStatus
);

requestRouter.delete(
    '/requests/:id',
    authenticate,
    allowAdmin,
    validateRequestIdParams,
    requestController.deleteRequest
);

requestRouter.post(
    '/requests/:id/assignees',
    authenticate,
    allowAdmin,
    validateRequestIdParams,
    validateAssignRequestTeamBody,
    requestAssigneeController.replaceRequestTeam
);

requestRouter.delete(
    '/requests/:id/assignees/:technicianId',
    authenticate,
    allowAdmin,
    validateRequestAssigneeParams,
    requestAssigneeController.removeRequestAssignee
);

export { requestRouter };
