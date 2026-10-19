import { z } from 'zod';
import { dateStringSchema, limitSchema, pageSchema } from './CommonRequestDto';

export const getTransactionsQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  transaction_id: z.string().optional(),
  order_id: z.string().optional(),
  method: z.enum(['CASH', 'QR']).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'FAILED', 'VOIDED', 'REFUNDED']).optional(),
  start_date: dateStringSchema.optional(),
  end_date: dateStringSchema.optional(),
});

export type GetTransactionsQueryDto = z.infer<typeof getTransactionsQuerySchema>;
