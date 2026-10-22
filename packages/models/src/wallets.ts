import { pgTable, decimal, timestamp, serial } from 'drizzle-orm/pg-core';

export const wallets = pgTable('wallet', {
  id: serial('id').primaryKey(),
  balance: decimal('balance', { precision: 10, scale: 4 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
