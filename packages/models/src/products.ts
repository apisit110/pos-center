import { pgTable, varchar, decimal, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { merchants } from './merchants';
import { brands } from './brands';

export const products = pgTable('product', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  brandId: integer('brand_id').references(() => brands.id),
  uid: varchar('uid', { length: 100 }).unique().notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameTh: varchar('name_th', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }).notNull(),
  barcode: varchar('barcode', { length: 100 }),
  basePrice: decimal('base_price', { precision: 10, scale: 4 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  unitName: varchar('unit_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
