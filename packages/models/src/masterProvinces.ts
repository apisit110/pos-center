import { pgTable, varchar, timestamp, serial } from 'drizzle-orm/pg-core';

export const provinces = pgTable('master_provinces', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).unique(),
  nameEn: varchar('name_en', { length: 255 }),
  nameTh: varchar('name_th', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
