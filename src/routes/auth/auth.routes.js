import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import {
    validateLoginBody,
    validateRegisterBody,
} from '../../middlewares/validate.middleware.js';
import { loginRateLimiter } from '../../middlewares/rate-limit.middleware.js';

const authRouter = Router();

authRouter.post(
    '/auth/register',
    validateRegisterBody,
    authController.register
);

authRouter.post(
    '/auth/login',
    loginRateLimiter,
    validateLoginBody,
    authController.login
);

export { authRouter };
