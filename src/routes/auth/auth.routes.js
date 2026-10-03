import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import {
    validateLoginBody,
    validateRegisterBody,
} from '../../middlewares/validate.middleware.js';
import { loginRateLimiter } from '../../middlewares/rate-limit.middleware.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';

const authRouter = Router();

authRouter.get('/auth/me', authenticate, authController.getMe);

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

authRouter.post('/auth/refresh', authController.refresh);
authRouter.post('/auth/logout', authController.logout);

export { authRouter };
