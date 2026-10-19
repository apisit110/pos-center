import { z } from 'zod';

export const createMerchantSchema = z.object({
  name: z.string().trim().min(1),
  staff_members: z.array(
    z.object({
      full_name: z.string().min(1),
      pin: z.string().min(1),
      role: z.enum(['manager', 'cashier']),
    }),
  ),
  stores: z
    .array(
      z.object({
        name: z.string().min(1),
        address: z.string(),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        terminals: z.array(z.object({ name: z.string().min(1) })).default([]),
      }),
    )
    .default([]),
});

export type CreateMerchantRequestDto = z.infer<typeof createMerchantSchema>;
