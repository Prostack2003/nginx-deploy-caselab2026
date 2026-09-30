import { z } from 'zod';

const equipmentTypeSchema = z.enum([
    'turbine',
    'inverter',
    'sensor',
    'substation',
]);
const equipmentStatusSchema = z.enum([
    'operational',
    'maintenance',
    'fault',
    'decommissioned',
]);
const locationSchema = z.object({
    lat: z.number().gte(-90).lte(90),
    lon: z.number().gte(-180).lte(180),
});

const installedAtSchema = z.iso.date();

const equipmentIdParamsSchema = z.object({
    id: z.uuid(),
});

const createEquipmentBodySchema = z.object({
    name: z.string().trim().min(3).max(100),
    type: equipmentTypeSchema,
    serialNumber: z.string().trim().min(1),
    location: locationSchema,
    status: equipmentStatusSchema,
    installedAt: installedAtSchema,
});

const equipmentQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        type: equipmentTypeSchema.optional(),
        status: equipmentStatusSchema.optional(),
        sortBy: z
            .enum(['name', 'type', 'serialNumber', 'status', 'installedAt'])
            .default('name'),
        order: z.enum(['asc', 'desc']).default('asc'),
        installedFrom: z.iso.date().optional(),
        installedTo: z.iso.date().optional(),
    })
    .refine(
        (query) => {
            if (!query.installedFrom || !query.installedTo) {
                return true;
            }

            return query.installedFrom <= query.installedTo;
        },
        {
            message: 'installedFrom не может быть позже installedTo',
            path: ['installedTo'],
        }
    );

const updateEquipmentBodySchema = createEquipmentBodySchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Передайте хотя бы одно поле для обновления оборудования',
        path: [],
    });

export {
    createEquipmentBodySchema,
    updateEquipmentBodySchema,
    equipmentIdParamsSchema,
    equipmentQuerySchema,
};
