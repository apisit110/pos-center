import { z } from 'zod';
import { limitSchema, pageSchema, stringArraySchema } from './CommonRequestDto';

export const getProductsQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  barcode: z.string().optional(),
  name: z.string().optional(),
  merchant_uid: z.string().optional(),
  brands: stringArraySchema,
  units: stringArraySchema,
  price: z.coerce.number().min(0).optional(),
  store_uid: z.string().optional(),
});

export type GetProductsQueryDto = z.infer<typeof getProductsQuerySchema>;
