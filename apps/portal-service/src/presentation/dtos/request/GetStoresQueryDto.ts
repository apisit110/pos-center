import { z } from 'zod';

export const getStoresQuerySchema = z.object({
  merchant_uid: z.string().optional(),
});

export type GetStoresQueryDto = z.infer<typeof getStoresQuerySchema>;
