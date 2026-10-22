import { pgTable, timestamp, integer, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { stores } from './stores';
import { addresses } from './addresses';

export const addressTypeEnum = pgEnum('address_type', ['REGISTERED', 'CONTRACT']);

export const mapStoreAddress = pgTable('map_store_address', {
  storeId: integer('store_id').references(() => stores.id).notNull(),
  addressId: integer('address_id').references(() => addresses.id).notNull(),
  type: addressTypeEnum('type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.storeId, table.addressId] }),
}));
