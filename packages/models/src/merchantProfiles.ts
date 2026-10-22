import { pgTable, varchar, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { merchants } from './merchants';

export const merchantProfiles = pgTable('merchant_profile', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  mid: varchar('mid', { length: 50 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
