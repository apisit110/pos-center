import { pgTable, varchar, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { merchants } from './merchants';

export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).unique().notNull(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
