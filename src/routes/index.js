import { Router } from 'express';
import { healthRouter } from './health/health.routes.js';
import { equipmentRouter } from './equipment/equipment.routes.js';
import { requestRouter } from './requests/request.routes.js';
import { siteRouter } from './sites/site.routes.js';
import { reportRouter } from './reports/report.routes.js';
import { authRouter } from './auth/auth.routes.js';
import { technicianRouter } from './technicians/technician.routes.js';

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(equipmentRouter);
apiRouter.use(requestRouter);
apiRouter.use(siteRouter);
apiRouter.use(technicianRouter);
apiRouter.use(reportRouter);
apiRouter.use(authRouter);

export { apiRouter };
