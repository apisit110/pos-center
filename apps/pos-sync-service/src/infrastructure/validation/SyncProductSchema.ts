import { z } from 'zod';

export const syncProductSchema = z.object({
  mid: z.string().min(1, 'mid is required'),
  sid: z.string().min(1, 'sid is required'),
  syncVersion: z.number().int().min(0, 'syncVersion must be a non-negative integer'),
});

export type SyncProductRequest = z.infer<typeof syncProductSchema>;
