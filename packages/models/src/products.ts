import { pgTable, text, varchar, decimal, timestamp, serial, integer, jsonb } from 'drizzle-orm/pg-core';
import { merchants } from './merchants';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).unique().notNull(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }),
  barcode: varchar('barcode', { length: 100 }),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: jsonb('image_url'),
  brand: varchar('brand', { length: 100 }),
  unitName: varchar('unit_name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
