import { z } from 'zod';

export const syncProductSchema = z.object({
  merchantId: z.string().uuid('merchantId must be a valid UUID'),
  storeId: z.string().min(1, 'storeId is required'),
  syncVersion: z.number().int().min(0, 'syncVersion must be a non-negative integer'),
});

export type SyncProductRequest = z.infer<typeof syncProductSchema>;
