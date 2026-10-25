import { z } from 'zod';

export const syncProductRequestSchema = z.object({
  /** deprecated: taken from the sync token; checked against it when sent */
  mid: z.string().min(1).optional(),
  /** deprecated: taken from the sync token; checked against it when sent */
  sid: z.string().min(1).optional(),
  syncVersion: z.number().int().min(0, 'syncVersion must be a non-negative integer'),
});

export type SyncProductRequestDto = z.infer<typeof syncProductRequestSchema>;
