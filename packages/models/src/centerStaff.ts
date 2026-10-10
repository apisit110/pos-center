import { pgTable, varchar, timestamp, serial, integer, index } from 'drizzle-orm/pg-core';
import { merchants } from './merchants';

export const staff = pgTable('center_staff', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).unique().notNull(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }),
  status: varchar('status', { length: 20 }).default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  usernameIdx: index('center_staff_username_idx').on(table.username),
}));
