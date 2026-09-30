import { z } from 'zod';

const siteIdParamsSchema = z.object({
    id: z.uuid(),
});

export { siteIdParamsSchema };
