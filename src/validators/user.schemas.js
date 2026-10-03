import { z } from 'zod';

const userIdParamsSchema = z.object({
    id: z.uuid(),
});

const userQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        sortBy: z
            .enum(['email', 'role', 'isActive', 'createdAt'])
            .default('email'),
        order: z.enum(['asc', 'desc']).default('asc'),
    })
    .strict();

const updateUserAccessBodySchema = z
    .object({
        role: z.enum(['viewer', 'technician', 'admin']).optional(),
        technicianId: z.uuid().nullable().optional(),
        isActive: z.boolean().optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Передайте хотя бы одно поле для изменения доступа',
        path: [],
    });

export { userIdParamsSchema, userQuerySchema, updateUserAccessBodySchema };
