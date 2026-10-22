import { pgTable, decimal, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { stores } from './stores';
import { products } from './products';

export const storeProducts = pgTable('map_store_product', {
  storeId: integer('store_id').references(() => stores.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  stock: integer('stock').notNull(),
  price: decimal('price', { precision: 10, scale: 4 }).notNull(),
  syncVersion: integer('sync_version').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.storeId, table.productId] }),
}));
