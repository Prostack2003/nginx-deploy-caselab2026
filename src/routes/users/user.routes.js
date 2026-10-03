import { Router } from 'express';
import {
    listUsers,
    updateUserAccess,
} from '../../controllers/user.controller.js';
import { allowAdmin } from '../../auth/role-policies.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';
import {
    validateUserIdParams,
    validateUserQuery,
    validateUpdateUserAccessBody,
} from '../../middlewares/validate.middleware.js';

const userRouter = Router();

userRouter.get(
    '/users',
    authenticate,
    allowAdmin,
    validateUserQuery,
    listUsers
);

userRouter.patch(
    '/users/:id/access',
    authenticate,
    allowAdmin,
    validateUserIdParams,
    validateUpdateUserAccessBody,
    updateUserAccess
);

export { userRouter };
