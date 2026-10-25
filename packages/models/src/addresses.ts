import { pgTable, varchar, decimal, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { provinces } from './masterProvinces';
import { districts } from './masterDistricts';
import { subDistricts } from './masterSubDistricts';
import { postalCodes } from './masterPostalCodes';

export const addresses = pgTable('address', {
  id: serial('id').primaryKey(),
  provinceId: integer('province_id').references(() => provinces.id).notNull(),
  districtId: integer('district_id').references(() => districts.id).notNull(),
  subDistrictId: integer('sub_district_id').references(() => subDistricts.id).notNull(),
  postalCodeId: integer('postal_code_id').references(() => postalCodes.id).notNull(),
  address1: varchar('address_1', { length: 255 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
