import { Router } from 'express';
import {
    getLiveness,
    getReadiness,
} from '../../controllers/health.controller.js';

const healthRouter = Router();

healthRouter.get('/health/live', getLiveness);
healthRouter.get('/health/ready', getReadiness);
healthRouter.get('/health', getLiveness);

export { healthRouter };
