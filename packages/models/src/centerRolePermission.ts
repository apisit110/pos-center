import { pgTable, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { role } from './centerRole';
import { permission } from './centerPermission';

export const rolePermission = pgTable('center_role_permission', {
  roleId: integer('role_id').references(() => role.id).notNull(),
  permissionId: integer('permission_id').references(() => permission.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));
