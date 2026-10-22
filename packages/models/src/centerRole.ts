import { pgTable, varchar, timestamp, serial } from 'drizzle-orm/pg-core';

export const role = pgTable('center_role', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
