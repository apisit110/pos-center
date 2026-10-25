import { z } from 'zod';

export const receiveProductsRequestSchema = z.object({
  /** deprecated: taken from the sync token; checked against it when sent */
  mid: z.string().min(1).optional(),
  /** deprecated: taken from the sync token; checked against it when sent */
  sid: z.string().min(1).optional(),
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

export type ReceiveProductsRequestDto = z.infer<typeof receiveProductsRequestSchema>;
