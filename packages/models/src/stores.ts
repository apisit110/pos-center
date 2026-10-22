import { pgTable, varchar, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { merchants } from './merchants';

export const stores = pgTable('store', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  uid: varchar('uid', { length: 100 }).unique().notNull(),
  sid: varchar('sid', { length: 50 }).unique().notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameTh: varchar('name_th', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
