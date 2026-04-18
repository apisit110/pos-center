import { pgTable, text, varchar, decimal, uuid, timestamp } from 'drizzle-orm/pg-core';
import { merchants } from './merchants';

export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => merchants.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
