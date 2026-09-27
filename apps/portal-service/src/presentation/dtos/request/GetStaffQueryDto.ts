import { z } from 'zod';

export const getStaffQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  merchantId: z.string().optional(),
  role: z.string().optional(),
  username: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  query: z.string().optional(),
});

export type GetStaffQueryDto = z.infer<typeof getStaffQuerySchema>;
