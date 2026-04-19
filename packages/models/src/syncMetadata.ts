import { pgTable, varchar, integer, serial, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const syncStatusEnum = pgEnum('sync_status', ['IDLE', 'SYNCING', 'ERROR', 'SUCCESS']);

export const syncMetadata = pgTable('sync_metadata', {
  id: serial('id').primaryKey(),
  lastProductSyncVersion: integer('last_product_sync_version').notNull().default(0),
  status: syncStatusEnum('status').notNull().default('IDLE'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
