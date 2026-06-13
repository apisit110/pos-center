import { z } from 'zod';

export const receiveProductsSchema = z.object({
  mid: z.string().min(1, 'mid is required'),
  sid: z.string().min(1, 'sid is required'),
  products: z.array(
    z.object({
      id: z.string().min(1),
      barcode: z.string().min(1),
      name: z.string().min(1),
      basePrice: z.number().nonnegative(),
      imageUrl: z.string().nullable().optional(),
      unitName: z.string().nullable().optional(),
      brand: z.string().nullable().optional(),
    }),
  ).min(1, 'products must not be empty'),
});

export type ReceiveProductsRequest = z.infer<typeof receiveProductsSchema>;
