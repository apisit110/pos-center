import { pgTable, varchar, serial, integer } from 'drizzle-orm/pg-core';
import { subDistricts } from './subDistricts';

export const postalCodes = pgTable('postal_code', {
  id: serial('id').primaryKey(),
  subDistrictId: integer('sub_district_id').references(() => subDistricts.id),
  code: varchar('code', { length: 10 }).unique(),
});
