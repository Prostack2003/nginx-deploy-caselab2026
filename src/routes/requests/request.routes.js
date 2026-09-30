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

const requestRouter = Router();

requestRouter.get(
    '/requests',
    validateRequestQuery,
    requestController.listRequests
);
requestRouter.get(
    '/requests/:id',
    validateRequestIdParams,
    requestController.getRequestById
);

requestRouter.get(
    '/requests/:id/history',
    validateRequestIdParams,
    requestStatusHistoryController.listRequestStatusHistory
);

requestRouter.post(
    '/requests',
    validateCreateRequestBody,
    requestController.createRequest
);

requestRouter.patch(
    '/requests/:id',
    validateRequestIdParams,
    validateUpdateRequestBody,
    requestController.updateRequest
);

requestRouter.patch(
    '/requests/:id/status',
    validateRequestIdParams,
    validateChangeRequestStatusBody,
    requestController.changeRequestStatus
);

requestRouter.delete(
    '/requests/:id',
    validateRequestIdParams,
    requestController.deleteRequest
);

requestRouter.post(
    '/requests/:id/assignees',
    validateRequestIdParams,
    validateAssignRequestTeamBody,
    requestAssigneeController.replaceRequestTeam
);

requestRouter.delete(
    '/requests/:id/assignees/:userId',
    validateRequestAssigneeParams,
    requestAssigneeController.removeRequestAssignee
);

export { requestRouter };
