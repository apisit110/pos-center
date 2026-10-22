import { pgTable, varchar, timestamp, serial, integer, index } from 'drizzle-orm/pg-core';

export const pins = pgTable('pin', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 100 }).unique().notNull(),
  appId: varchar('app_id', { length: 20 }).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  pinHash: varchar('pin_hash', { length: 255 }).notNull(),
  pinFailedAttempts: integer('pin_failed_attempts'),
  pinLockedUntil: timestamp('pin_locked_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  usernameIdx: index('pin_username_idx').on(table.username),
}));
