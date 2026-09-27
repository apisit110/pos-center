import { z } from 'zod';

export const createProductSchema = z.object({
  merchantId: z.string().min(1, 'merchantId is required'),
  name: z.string().min(1, 'name is required'),
  barcode: z.string().optional(),
  basePrice: z.coerce.number(),
  imageUrl: z.union([z.string(), z.array(z.string())]).optional(),
  brand: z.string().optional(),
  unitName: z.string().optional(),
});

export type CreateProductRequestDto = z.infer<typeof createProductSchema>;
