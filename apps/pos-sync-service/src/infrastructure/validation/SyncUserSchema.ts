import { z } from 'zod';

export const SyncUserSchema = z.object({
  users: z.array(z.object({
    posTempId: z.string().uuid(),
    userId: z.string(),
    fullName: z.string(),
    pinHash: z.string(),
    roleId: z.number(),
    branchIds: z.array(z.number()),
    status: z.enum(['active', 'inactive']),
    originBranchId: z.number(),
  })),
});
