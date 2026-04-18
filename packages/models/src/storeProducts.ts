import { pgTable, varchar, decimal, uuid, timestamp, integer } from 'drizzle-orm/pg-core';
import { stores } from './stores';
import { products } from './products';

export const storeProducts = pgTable('store_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').references(() => stores.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  stock: integer('stock').notNull().default(0),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
