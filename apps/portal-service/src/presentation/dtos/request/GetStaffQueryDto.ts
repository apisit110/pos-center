import { z } from 'zod';
import { dateStringSchema, limitSchema, pageSchema } from './CommonRequestDto';

export const getStaffQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  merchant_uid: z.string().optional(),
  role: z.string().optional(),
  username: z.string().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'INACTIVE', 'SUSPENDED']).optional(),
  query: z.string().optional(),
  start_date: dateStringSchema.optional(),
  end_date: dateStringSchema.optional(),
});

export type GetStaffQueryDto = z.infer<typeof getStaffQuerySchema>;
