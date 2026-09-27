import { z } from 'zod';

export const getStoresQuerySchema = z.object({
  merchantId: z.string().optional(),
});

export type GetStoresQueryDto = z.infer<typeof getStoresQuerySchema>;
