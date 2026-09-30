import { z } from 'zod';

const equipmentLoadReportQuerySchema = z
    .object({
        createdFrom: z.iso.datetime().optional(),
        createdTo: z.iso.datetime().optional(),
        minRequests: z.coerce.number().int().nonnegative().default(0),
    })
    .refine(
        (query) =>
            query.createdFrom === undefined ||
            query.createdTo === undefined ||
            Date.parse(String(query.createdFrom)) <=
                Date.parse(String(query.createdTo)),
        {
            message: 'createdFrom не может быть позже createdTo',
            path: ['createdTo'],
        }
    );

export { equipmentLoadReportQuerySchema };
