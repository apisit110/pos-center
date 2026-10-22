import { pgTable, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { staff } from './centerStaff';
import { role } from './centerRole';

export const staffRole = pgTable('center_staff_role', {
  staffId: integer('staff_id').references(() => staff.id).notNull(),
  roleId: integer('role_id').references(() => role.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.staffId, table.roleId] }),
}));
