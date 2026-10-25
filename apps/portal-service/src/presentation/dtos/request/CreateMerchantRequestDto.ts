import { z } from 'zod';

const nameSchema = z.string().trim().min(1).max(255);

const addressSchema = z
  .object({
    address_1: z.string().max(255).optional(),
    province_code: z.string().min(1),
    district_code: z.string().min(1),
    sub_district_code: z.string().min(1),
    postal_code: z.string().min(1),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine((address) => (address.latitude === undefined) === (address.longitude === undefined), {
    message: 'latitude and longitude must be both present or both absent',
    path: ['latitude'],
  });

export const createMerchantSchema = z.object({
  name_en: nameSchema,
  name_th: nameSchema,
  cashier_staff: z.array(
    z.object({
      full_name: z.string().min(1).max(255),
      pin: z.string(),
      role: z.string().min(1),
    }),
  ),
  stores: z
    .array(
      z.object({
        name_en: nameSchema,
        name_th: nameSchema,
        registered_address: addressSchema,
        contract_address: addressSchema,
        terminals: z.array(z.object({ name_en: nameSchema, name_th: nameSchema })).default([]),
      }),
    )
    .default([]),
});

export type CreateMerchantRequestDto = z.infer<typeof createMerchantSchema>;
export type AddressRequestDto = z.infer<typeof addressSchema>;
