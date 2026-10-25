import { pgTable, varchar, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { districts } from './masterDistricts';

export const subDistricts = pgTable('master_sub_districts', {
  id: serial('id').primaryKey(),
  districtId: integer('district_id').references(() => districts.id),
  code: varchar('code', { length: 20 }).unique(),
  nameEn: varchar('name_en', { length: 255 }),
  nameTh: varchar('name_th', { length: 255 }),
  latitude: varchar('latitude', { length: 50 }),
  longitude: varchar('longitude', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
