import { pgTable, varchar, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { provinces } from './provinces';

export const districts = pgTable('districts', {
  id: serial('id').primaryKey(),
  provinceId: integer('province_id').references(() => provinces.id),
  code: varchar('code', { length: 20 }).unique(),
  nameEn: varchar('name_en', { length: 255 }),
  nameTh: varchar('name_th', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
