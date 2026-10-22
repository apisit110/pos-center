import { pgTable, varchar, timestamp, serial, index, pgEnum } from 'drizzle-orm/pg-core';

export const cashierStaffStatusEnum = pgEnum('cashier_staff_status', ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE']);
export const cashierStaffSyncStatusEnum = pgEnum('cashier_staff_sync_status', ['PENDING', 'SYNCED', 'ERROR']);

export const cashierStaff = pgTable('cashier_staff', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 100 }).unique(),
  username: varchar('username', { length: 100 }),
  fullName: varchar('full_name', { length: 255 }),
  status: cashierStaffStatusEnum('status'),
  syncStatus: cashierStaffSyncStatusEnum('sync_status'),
  syncId: varchar('sync_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  usernameIdx: index('cashier_staff_username_idx').on(table.username),
}));
