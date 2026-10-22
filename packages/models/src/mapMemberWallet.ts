import { pgTable, integer, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { members } from './members';
import { wallets } from './wallets';

export const walletTypeEnum = pgEnum('wallet_type', ['POINT', 'CASH']);

export const mapMemberWallet = pgTable('map_member_wallet', {
  memberId: integer('member_id').references(() => members.id).notNull(),
  walletId: integer('wallet_id').references(() => wallets.id).notNull(),
  type: walletTypeEnum('type').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.memberId, table.walletId] }),
}));
