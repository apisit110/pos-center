import { pgTable, varchar, timestamp, uuid, integer, boolean, pgEnum, uniqueIndex, serial } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', ['active', 'inactive']);

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  roleName: varchar('role_name', { length: 255 }).notNull(),
  level: integer('level').notNull(),
});

export const rolePermissions = pgTable('role_permissions', {
  roleId: integer('role_id').references(() => roles.id).notNull(),
  permissionKey: varchar('permission_key', { length: 255 }).notNull(),
  isGranted: boolean('is_granted').default(true).notNull(),
});

export const branches = pgTable('branches', {
  id: serial('id').primaryKey(),
  branchCode: varchar('branch_code', { length: 100 }).unique().notNull(),
  branchName: varchar('branch_name', { length: 255 }).notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  pinHash: varchar('pin_hash', { length: 255 }).notNull(),
  roleId: integer('role_id').references(() => roles.id).notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: uniqueIndex('user_id_idx').on(table.userId),
}));

export const userBranchAccess = pgTable('user_branch_access', {
  userId: uuid('user_id').references(() => users.id).notNull(),
  branchId: integer('branch_id').references(() => branches.id).notNull(),
});

export const userSyncLogs = pgTable('user_sync_logs', {
  id: serial('id').primaryKey(),
  posTempId: uuid('pos_temp_id').notNull(),
  originBranchId: integer('origin_branch_id').references(() => branches.id).notNull(),
  globalUserId: uuid('global_user_id').references(() => users.id).notNull(),
});
