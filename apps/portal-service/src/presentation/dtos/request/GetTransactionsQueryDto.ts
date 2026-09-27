import { z } from 'zod';

export const getTransactionsQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  transactionId: z.string().optional(),
  orderId: z.string().optional(),
  method: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type GetTransactionsQueryDto = z.infer<typeof getTransactionsQuerySchema>;
