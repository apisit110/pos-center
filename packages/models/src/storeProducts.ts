import { pgTable, varchar, decimal, timestamp, integer, serial, jsonb } from 'drizzle-orm/pg-core';
import { stores } from './stores';
import { products } from './products';

export const storeProducts = pgTable('store_products', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).unique().notNull(), // Custom ID e.g., SP-001
  storeId: integer('store_id').references(() => stores.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  stock: integer('stock').notNull().default(0),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  priceTiers: jsonb('price_tiers'),
  unit: varchar('unit', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
