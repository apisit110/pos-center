import { pgTable, varchar, decimal, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { stores } from './stores';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).unique().notNull(), // Global unique ID from POS
  orderId: integer('order_id').references(() => orders.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  staffName: varchar('staff_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const transactionSyncLogs = pgTable('transaction_sync_logs', {
  id: serial('id').primaryKey(),
  posTempId: varchar('pos_temp_id', { length: 255 }).notNull(), // The ID from POS
  storeId: integer('store_id').references(() => stores.id).notNull(),
  globalTransactionId: integer('global_transaction_id').references(() => transactions.id).notNull(),
  syncedAt: timestamp('synced_at').defaultNow(),
});
