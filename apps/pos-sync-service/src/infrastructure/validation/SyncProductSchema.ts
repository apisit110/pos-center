import { z } from 'zod';

export const syncProductSchema = z.object({
  merchantUid: z.string().uuid('merchantUid must be a valid UUID'),
  storeUid: z.string().min(1, 'storeUid is required'),
  syncVersion: z.number().int().min(0, 'syncVersion must be a non-negative integer'),
});

export type SyncProductRequest = z.infer<typeof syncProductSchema>;
