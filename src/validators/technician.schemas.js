import { z } from 'zod';

const technicianIdParamsSchema = z.object({
    id: z.uuid(),
});

const createTechnicianBodySchema = z
    .object({
        fullName: z.string().trim().min(3).max(200),
        specialization: z.string().trim().min(2).max(150),
        employeeNumber: z.string().trim().min(1).max(50).toUpperCase(),
    })
    .strict();

const updateTechnicianBodySchema = createTechnicianBodySchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Передайте хотя бы одно поле для обновления специалиста',
        path: [],
    });

const technicianQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        sortBy: z
            .enum(['fullName', 'specialization', 'employeeNumber'])
            .default('fullName'),
        order: z.enum(['asc', 'desc']).default('asc'),
    })
    .strict();

export {
    technicianIdParamsSchema,
    createTechnicianBodySchema,
    updateTechnicianBodySchema,
    technicianQuerySchema,
};
