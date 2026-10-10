import { pgTable, varchar, timestamp, serial, integer, uuid, uniqueIndex } from 'drizzle-orm/pg-core';

export const pins = pgTable('center_pin', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().unique().notNull(),
  appId: varchar('app_id', { length: 50 }).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  pinHash: varchar('pin_hash', { length: 255 }).notNull(),
  pinFailedAttempts: integer('pin_failed_attempts').default(0).notNull(),
  pinLockedUntil: timestamp('pin_locked_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  appIdUsernameUq: uniqueIndex('center_pin_app_id_username_uq').on(table.appId, table.username),
}));
