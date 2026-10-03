import { authorizeRoles } from '../middlewares/authorize-roles.middleware.js';

const allowDomainRead = authorizeRoles('viewer', 'technician', 'admin');

const allowTechnicianOrAdmin = authorizeRoles('technician', 'admin');

const allowAdmin = authorizeRoles('admin');

export { allowDomainRead, allowTechnicianOrAdmin, allowAdmin };
