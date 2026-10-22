import { pgTable, varchar, serial, integer, boolean } from 'drizzle-orm/pg-core';
import { cashierRole } from './cashierRole';

// permissionKey matches cashier_permission.name (logical reference, no FK)
export const cashierRolePermission = pgTable('cashier_role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').references(() => cashierRole.id),
  permissionKey: varchar('permission_key', { length: 100 }),
  isGranted: boolean('is_granted'),
});
