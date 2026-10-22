import { pgTable, varchar, timestamp, serial, integer, index } from 'drizzle-orm/pg-core';
import { stores } from './stores';

export const orderSyncLogs = pgTable('order_sync_logs', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').references(() => stores.id).notNull(),
  posTempId: varchar('pos_temp_id', { length: 100 }),
  globalOrderId: varchar('global_order_id', { length: 100 }),
  syncedAt: timestamp('synced_at'),
}, (table) => ({
  posTempIdIdx: index('order_sync_logs_pos_temp_id_idx').on(table.posTempId),
  globalOrderIdIdx: index('order_sync_logs_global_order_id_idx').on(table.globalOrderId),
}));
