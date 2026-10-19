import { z } from 'zod';

export const MAX_BATCH_ITEMS = 1000;

export const bulkCreateProductItemSchema = z.object({
  uid: z.string().optional(),
  merchant_uid: z.string().min(1),
  name: z.string().min(1),
  barcode: z.string().optional(),
  base_price: z.coerce.number().min(0),
  image_url: z.array(z.string()).optional(),
  brand: z.string().optional(),
  unit_name: z.string().optional(),
});

export const bulkCreateProductsSchema = z.object({
  products: z.array(bulkCreateProductItemSchema).max(MAX_BATCH_ITEMS),
});

export type BulkCreateProductsRequestDto = z.infer<typeof bulkCreateProductsSchema>;
