import { pgTable, varchar, decimal, timestamp, serial, integer, boolean } from 'drizzle-orm/pg-core';
import { merchants } from './merchants';
import { stores } from './stores';
import { terminals } from './terminals';
import { cashierStaff } from './cashierStaff';
import { members } from './members';

export const orders = pgTable('order', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  terminalId: integer('terminal_id').references(() => terminals.id).notNull(),
  cashierStaffId: integer('cashier_staff_id').references(() => cashierStaff.id).notNull(),
  memberId: integer('member_id').references(() => members.id),
  orderId: varchar('order_id', { length: 100 }).unique().notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 4 }).notNull(),
  status: varchar('status', { length: 20, enum: ['PENDING', 'PAID', 'VOID', 'REFUNDED'] }).notNull(),
  isSynced: boolean('is_synced').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
