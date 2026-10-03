import { z } from 'zod';

const locationSchema = z.object({
    lat: z.number().gte(-90).lte(90),
    lon: z.number().gte(-180).lte(180),
});

const siteIdParamsSchema = z.object({
    id: z.uuid(),
});

const createSiteBodySchema = z
    .object({
        name: z.string().trim().min(3).max(150),
        code: z.string().trim().min(1).max(50).toUpperCase(),
        region: z.string().trim().min(2).max(100),
        location: locationSchema,
    })
    .strict();

const updateSiteBodySchema = createSiteBodySchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Передайте хотя бы одно поле для обновления площадки',
        path: [],
    });

const siteQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        sortBy: z.enum(['name', 'code', 'region']).default('name'),
        order: z.enum(['asc', 'desc']).default('asc'),
    })
    .strict();

export {
    siteIdParamsSchema,
    createSiteBodySchema,
    updateSiteBodySchema,
    siteQuerySchema,
};
