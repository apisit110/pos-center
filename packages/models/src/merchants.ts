import { pgTable, varchar, uuid, timestamp, serial } from 'drizzle-orm/pg-core';

export const merchants = pgTable('merchants', {
  id: serial('id').primaryKey(),
  uid: uuid('uid').defaultRandom().unique().notNull(),
  mid: varchar('mid', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
