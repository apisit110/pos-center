import { pgTable, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { stores } from './stores';
import { terminals } from './terminals';

export const mapStoreTerminal = pgTable('map_store_terminal', {
  storeId: integer('store_id').references(() => stores.id).notNull(),
  terminalId: integer('terminal_id').references(() => terminals.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.storeId, table.terminalId] }),
}));
