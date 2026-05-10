import { z } from 'zod';

export const syncOrderSchema = z.object({
  orders: z.array(z.object({
    posTempId: z.string().min(1),
    orderNumber: z.string().min(1),
    merchantId: z.string().min(1),
    storeId: z.string().min(1),
    terminalId: z.string().nullable(),
    staffId: z.string().nullable(),
    totalAmount: z.number(),
    status: z.enum(['PENDING', 'PAID', 'CANCELLED']),
    items: z.array(z.object({
      productId: z.string().nullable(),
      productUid: z.string().nullable(),
      name: z.string(),
      quantity: z.number().int(),
      price: z.number(),
      subtotal: z.number(),
    })),
    createdAt: z.string().optional(),
  })),
});
