import { z } from 'zod';

export const createProductSchema = z.object({
  merchant_uid: z.string().min(1),
  name: z.string().trim().min(1),
  barcode: z.string().optional(),
  base_price: z.coerce.number().min(0),
  image_url: z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .optional(),
  brand: z.string().optional(),
  unit_name: z.string().optional(),
});

export type CreateProductRequestDto = z.infer<typeof createProductSchema>;
