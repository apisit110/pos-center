import { z } from 'zod';

export const getMerchantsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  mid: z.string().optional(),
  name: z.string().optional(),
});

export type GetMerchantsQueryDto = z.infer<typeof getMerchantsQuerySchema>;
