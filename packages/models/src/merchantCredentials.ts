import { pgTable, varchar, timestamp, serial, integer, pgEnum, unique } from 'drizzle-orm/pg-core';
import { merchants } from './merchants';

export const merchantCredentialProviderEnum = pgEnum('merchant_credential_provider', ['POS_CASHIER']);

export const merchantCredentials = pgTable('merchant_credential', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  provider: merchantCredentialProviderEnum('provider').notNull(),
  clientId: varchar('client_id', { length: 255 }).unique().notNull(),
  clientSecret: varchar('client_secret', { length: 255 }).notNull(), // store SHA-256 hash, never the plain secret
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  merchantProviderUnique: unique('merchant_credential_merchant_provider_unique').on(table.merchantId, table.provider),
}));
