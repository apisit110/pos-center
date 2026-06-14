import { pgTable, varchar, decimal, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { stores } from './stores';

export const transactions = pgTable('transactions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  uid: varchar('uid', { length: 255 }).unique().notNull(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  merchantId: varchar('merchant_id', { length: 255 }).notNull(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  terminalId: varchar('terminal_id', { length: 255 }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  staffName: varchar('staff_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const transactionSyncLogs = pgTable('transaction_sync_logs', {
  id: serial('id').primaryKey(),
  posTempId: varchar('pos_temp_id', { length: 255 }).notNull(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  globalTransactionId: varchar('global_transaction_id', { length: 255 }).references(() => transactions.id).notNull(),
  syncedAt: timestamp('synced_at').defaultNow(),
});
