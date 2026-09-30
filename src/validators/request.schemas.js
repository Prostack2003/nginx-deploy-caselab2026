import { z } from 'zod';

const requestPriorityTypeSchema = z.enum(['low', 'medium', 'high', 'critical']);
const requestStatusSchema = z.enum(['new', 'in_progress', 'done', 'rejected']);
const requestSortBySchema = z.enum([
    'createdAt',
    'updatedAt',
    'plannedAt',
    'priority',
    'status',
]);
const requestOrderBySchema = z.enum(['asc', 'desc']);
const requestAssigneeSchema = z.object({
    technicianId: z.uuid(),
    role: z.enum(['lead', 'member']),
    hours: z.number().positive().max(9999.99),
});

const requestIdParamsSchema = z.object({
    id: z.uuid(),
});

const requestAssigneeParamsSchema = requestIdParamsSchema.extend({
    userId: z.uuid(),
});

const requestQuerySchema = z
    .object({
        equipmentId: z.uuid().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        status: requestStatusSchema.optional(),
        priority: requestPriorityTypeSchema.optional(),
        sortBy: requestSortBySchema.default('createdAt'),
        order: requestOrderBySchema.default('asc'),
        createdFrom: z.iso.datetime().optional(),
        createdTo: z.iso.datetime().optional(),
    })
    .refine(
        (value) => {
            if (!value.createdFrom || !value.createdTo) {
                return true;
            }

            return Date.parse(value.createdFrom) <= Date.parse(value.createdTo);
        },
        {
            message: 'createdFrom не может быть позже createdTo',
            path: ['createdTo'],
        }
    );

const createRequestBodySchema = z.object({
    equipmentId: z.uuid(),
    title: z.string().trim().min(5).max(120),
    description: z.string().trim().min(1).max(2000).optional(),
    priority: requestPriorityTypeSchema,
    plannedAt: z.iso.datetime().optional(),
});

const updateRequestBodySchema = createRequestBodySchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Передайте хотя бы одно поле для обновления заявки',
        path: [],
    });

const changeRequestStatusBodySchema = z.object({
    status: requestStatusSchema,
});

const assignRequestTeamBodySchema = z.object({
    assignees: z.array(requestAssigneeSchema).min(1),
});

export {
    requestIdParamsSchema,
    requestQuerySchema,
    createRequestBodySchema,
    updateRequestBodySchema,
    changeRequestStatusBodySchema,
    assignRequestTeamBodySchema,
    requestAssigneeParamsSchema,
};
