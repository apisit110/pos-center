import { z } from 'zod';
import { MAX_BATCH_ITEMS } from './BulkCreateProductsRequestDto';

export const batchUpsertBrandsSchema = z.object({
  brands: z
    .array(
      z.object({
        uid: z.string().trim().min(1).max(100),
        name_en: z.string().trim().min(1).max(255),
        name_th: z.string().trim().min(1).max(255),
      }),
    )
    .max(MAX_BATCH_ITEMS),
});

export type BatchUpsertBrandsRequestDto = z.infer<typeof batchUpsertBrandsSchema>;
