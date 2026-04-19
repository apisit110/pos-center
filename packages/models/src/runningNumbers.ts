import { pgTable, varchar, integer, serial, timestamp } from 'drizzle-orm/pg-core';

export const runningNumbers = pgTable('running_numbers', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 255 }).unique().notNull(), // e.g., 'product_version'
  number: integer('number').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});
