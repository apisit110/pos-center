import { pgTable, varchar, timestamp, serial, index } from 'drizzle-orm/pg-core';

export const staff = pgTable('center_staff', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 100 }).unique().notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  status: varchar('status', { length: 20, enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  usernameIdx: index('center_staff_username_idx').on(table.username),
}));
