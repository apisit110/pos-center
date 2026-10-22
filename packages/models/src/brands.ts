import { pgTable, varchar, timestamp, serial } from 'drizzle-orm/pg-core';

export const brands = pgTable('brand', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 100 }).unique().notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameTh: varchar('name_th', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
