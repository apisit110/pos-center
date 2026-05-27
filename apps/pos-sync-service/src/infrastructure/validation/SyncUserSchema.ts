import { z } from 'zod';

export const SyncUserSchema = z.object({
  users: z.array(z.object({
    userId: z.string().min(1),
    fullName: z.string(),
    pinHash: z.string(),
    roleId: z.number(),
    branchIds: z.array(z.number()),
    status: z.enum(['active', 'inactive']),
    originBranchId: z.number(),
  })),
});
