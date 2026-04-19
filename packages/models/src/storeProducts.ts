import { pgTable, varchar, decimal, uuid, timestamp, integer, serial } from 'drizzle-orm/pg-core';
import { stores } from './stores';
import { products } from './products';

export const storeProducts = pgTable('store_products', {
  id: serial('id').primaryKey(),
  uid: uuid('uid').defaultRandom().unique().notNull(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  stock: integer('stock').notNull().default(0),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
