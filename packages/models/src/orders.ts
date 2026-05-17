import { pgTable, varchar, decimal, timestamp, serial, integer, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { merchants } from './merchants';
import { stores } from './stores';
import { terminals } from './terminals';
import { staff } from './staff';

export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PAID', 'CANCELLED']);

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 255 }).unique().notNull(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  terminalId: integer('terminal_id').references(() => terminals.id),
  staffId: integer('staff_id').references(() => staff.id).notNull(),
  memberId: varchar('member_id', { length: 255 }),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  isSynced: boolean('is_synced').notNull().default(false),
  createdAt: timestamp('created_at').notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
});

export const orderSyncLogs = pgTable('order_sync_logs', {
  id: serial('id').primaryKey(),
  posTempId: varchar('pos_temp_id', { length: 255 }).notNull(), // The ID from POS
  storeId: integer('store_id').references(() => stores.id).notNull(),
  globalOrderId: integer('global_order_id').references(() => orders.id).notNull(),
  syncedAt: timestamp('synced_at').defaultNow(),
});
