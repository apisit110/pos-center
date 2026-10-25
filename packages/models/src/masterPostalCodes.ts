import { pgTable, varchar, serial, integer, unique } from 'drizzle-orm/pg-core';
import { subDistricts } from './masterSubDistricts';

export const postalCodes = pgTable('master_postal_code', {
  id: serial('id').primaryKey(),
  subDistrictId: integer('sub_district_id').references(() => subDistricts.id),
  code: varchar('code', { length: 10 }),
}, (t) => ({
  subDistrictCodeUnique: unique('master_postal_code_sub_district_id_code_unique').on(t.subDistrictId, t.code),
}));
