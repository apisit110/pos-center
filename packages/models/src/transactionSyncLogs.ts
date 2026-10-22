import { pgTable, varchar, timestamp, serial, integer, index } from 'drizzle-orm/pg-core';

// globalTransactionId matches transactions.uid (logical reference)
export const transactionSyncLogs = pgTable('transaction_sync_logs', {
  id: serial('id').primaryKey(),
  posTempId: varchar('pos_temp_id', { length: 100 }),
  storeId: integer('store_id'),
  globalTransactionId: varchar('global_transaction_id', { length: 100 }),
  syncedAt: timestamp('synced_at'),
}, (table) => ({
  posTempIdIdx: index('transaction_sync_logs_pos_temp_id_idx').on(table.posTempId),
  globalTransactionIdIdx: index('transaction_sync_logs_global_transaction_id_idx').on(table.globalTransactionId),
}));
