import { z } from 'zod';

export const bulkCreateProductItemSchema = z.object({
  uid: z.string().optional(),
  merchantId: z.string().min(1, 'merchantId is required'),
  name: z.string().min(1, 'name is required'),
  barcode: z.string().optional(),
  basePrice: z.coerce.number(),
  imageUrl: z.array(z.string()).optional(),
  brand: z.string().optional(),
  unitName: z.string().optional(),
});

export const bulkCreateProductsSchema = z.object({
  products: z.array(bulkCreateProductItemSchema),
});

export type BulkCreateProductsRequestDto = z.infer<typeof bulkCreateProductsSchema>;
