import { z } from 'zod';
import { limitSchema, pageSchema } from './CommonRequestDto';

export const getMerchantsQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  mid: z.string().optional(),
  name: z.string().optional(),
});

export type GetMerchantsQueryDto = z.infer<typeof getMerchantsQuerySchema>;
