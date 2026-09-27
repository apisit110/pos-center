import { z } from 'zod';

export const batchUpsertStoreProductsSchema = z.object({
  mappings: z.array(
    z.object({
      store_uid: z.string().optional(),
      product_uid: z.string().optional(),
      stock: z.coerce.number().optional(),
      price: z.coerce.number().optional(),
    })
  ),
});

export type BatchUpsertStoreProductsRequestDto = z.infer<typeof batchUpsertStoreProductsSchema>;
