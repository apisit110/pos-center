import { pgTable, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { cashierStaff } from './cashierStaff';
import { cashierRole } from './cashierRole';

export const cashierStaffRole = pgTable('cashier_staff_role', {
  staffId: integer('staff_id').references(() => cashierStaff.id).notNull(),
  roleId: integer('role_id').references(() => cashierRole.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.staffId, table.roleId] }),
}));
