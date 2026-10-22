import { pgTable, varchar, decimal, timestamp, serial, integer, index } from 'drizzle-orm/pg-core';

// Standalone: merchantId / storeId / terminalId are logical references (no FK)
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 100 }).unique().notNull(),
  orderId: varchar('order_id', { length: 100 }),
  merchantId: integer('merchant_id'),
  storeId: integer('store_id'),
  terminalId: integer('terminal_id'),
  amount: decimal('amount', { precision: 10, scale: 4 }),
  paymentMethod: varchar('payment_method', { length: 20, enum: ['CASH', 'QR'] }),
  status: varchar('status', { length: 20, enum: ['PENDING', 'APPROVED', 'FAILED', 'VOIDED', 'REFUNDED'] }),
  staffName: varchar('staff_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  orderIdIdx: index('transactions_order_id_idx').on(table.orderId),
}));
