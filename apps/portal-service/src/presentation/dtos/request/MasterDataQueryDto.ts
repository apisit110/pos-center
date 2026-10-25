import { z } from 'zod';

export const getDistrictsQuerySchema = z.object({
  province_code: z.string().min(1),
});

export const getSubDistrictsQuerySchema = z.object({
  district_code: z.string().min(1),
});

export const getPostalCodesQuerySchema = z.object({
  sub_district_code: z.string().min(1),
});
