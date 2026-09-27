import { z } from 'zod';

export const getMembersQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  query: z.string().optional(),
  tier: z.string().optional(),
});

export type GetMembersQueryDto = z.infer<typeof getMembersQuerySchema>;
