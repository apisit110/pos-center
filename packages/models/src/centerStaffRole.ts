import { pgTable, timestamp, integer } from 'drizzle-orm/pg-core';
import { staff } from './centerStaff';
import { role } from './centerRole';

export const staffRole = pgTable('center_staff_role', {
  staffId: integer('staff_id').references(() => staff.id).primaryKey(),
  roleId: integer('role_id').references(() => role.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
