import { z } from 'zod';

export const registerMerchantSchema = z.object({
  merchantName: z.string().min(1, 'merchantName is required'),
  staffMembers: z.array(
    z.object({
      fullName: z.string().min(1, 'fullName is required'),
      pin: z.string().min(1, 'pin is required'),
      role: z.enum(['manager', 'cashier']),
    })
  ),
  stores: z
    .array(
      z.object({
        name: z.string().min(1, 'name is required'),
        address: z.string(),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        terminals: z.array(z.object({ name: z.string().min(1, 'name is required') })).optional().default([]),
      })
    )
    .optional()
    .default([]),
});

export type RegisterMerchantRequestDto = z.infer<typeof registerMerchantSchema>;
