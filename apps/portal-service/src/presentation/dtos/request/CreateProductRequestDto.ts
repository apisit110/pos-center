import { z } from 'zod';

export const createProductSchema = z.object({
  merchant_uid: z.string().min(1),
  name_en: z.string().trim().min(1).max(255),
  name_th: z.string().trim().min(1).max(255),
  barcode: z.string().optional(),
  base_price: z.coerce.number().min(0),
  image_url: z.string().max(500).optional(),
  brand_uid: z.string().optional(),
  unit_name: z.string().max(50).optional(),
});

export type CreateProductRequestDto = z.infer<typeof createProductSchema>;
