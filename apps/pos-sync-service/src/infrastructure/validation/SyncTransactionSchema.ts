import { z } from 'zod';

export const syncTransactionSchema = z.object({
  transactions: z.array(z.object({
    posTempId: z.string().min(1),
    orderId: z.string().min(1),
    amount: z.number(),
    paymentMethod: z.string().min(1),
    status: z.string().min(1),
    staffName: z.string().optional().default(''),
    createdAt: z.string(),
    storeId: z.string().min(1),
  })),
});
