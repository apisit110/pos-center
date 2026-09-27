import { z } from 'zod';

const toArray = (val: unknown): string[] => {
  if (val === undefined) return [];
  return Array.isArray(val) ? (val as string[]) : [val as string];
};

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  barcode: z.string().optional(),
  name: z.string().optional(),
  merchantId: z.string().optional(),
  brands: z.preprocess(toArray, z.array(z.string())).optional().default([]),
  price: z.coerce.number().optional(),
  units: z.preprocess(toArray, z.array(z.string())).optional().default([]),
  storeId: z.string().optional(),
});

export type GetProductsQueryDto = z.infer<typeof getProductsQuerySchema>;
