import { pgTable, varchar, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { stores } from './stores';

export const terminals = pgTable('terminals', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).unique().notNull(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
