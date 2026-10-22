import { pgTable, varchar, timestamp, serial } from 'drizzle-orm/pg-core';

export const members = pgTable('member', {
  id: serial('id').primaryKey(),
  phoneNo: varchar('phone_no', { length: 20 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
