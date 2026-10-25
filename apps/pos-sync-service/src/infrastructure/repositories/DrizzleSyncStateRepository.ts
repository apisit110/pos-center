import { db, storeProducts, stores, merchants, eq, and, sql } from '@pos-center/database';
import { ISyncStateRepository } from '../../domain/repositories/ISyncStateRepository';
import { CASHIER_APP_ID } from './DrizzleCashierProfileRepository';

export class DrizzleSyncStateRepository implements ISyncStateRepository {
  async findProductVersion(partnerId: string, sid: string): Promise<number> {
    const [row] = await db.select({ version: sql<number>`coalesce(max(${storeProducts.syncVersion}), 0)` })
      .from(storeProducts)
      .innerJoin(stores, eq(storeProducts.storeId, stores.id))
      .innerJoin(merchants, eq(stores.merchantId, merchants.id))
      .where(and(eq(merchants.partnerId, partnerId), eq(stores.sid, sid)));
    return Number(row?.version ?? 0);
  }

  async findProfileVersion(partnerId: string, tid: string): Promise<string> {
    // same data as DrizzleCashierProfileRepository; count catches deletes, max(updated_at) catches inserts / updates
    const [row] = await db.execute<{ version: string }>(sql`
      SELECT md5(concat_ws('|',
        (SELECT updated_at FROM merchant WHERE partner_id = ${partnerId}),
        (SELECT concat_ws(',', terminal.updated_at, map_store_terminal.updated_at, store.id, store.updated_at)
           FROM terminal
           JOIN map_store_terminal ON map_store_terminal.terminal_id = terminal.id
           JOIN store ON store.id = map_store_terminal.store_id
          WHERE terminal.tid = ${tid}
          LIMIT 1),
        (SELECT concat_ws(',', count(*), max(cashier_staff.updated_at))
           FROM cashier_staff
           JOIN merchant ON merchant.id = cashier_staff.merchant_id
          WHERE merchant.partner_id = ${partnerId}),
        (SELECT concat_ws(',', count(*), max(cashier_staff_role.updated_at), max(cashier_role.updated_at))
           FROM cashier_staff_role
           JOIN cashier_staff ON cashier_staff.id = cashier_staff_role.staff_id
           JOIN merchant ON merchant.id = cashier_staff.merchant_id
           LEFT JOIN cashier_role ON cashier_role.id = cashier_staff_role.role_id
          WHERE merchant.partner_id = ${partnerId}),
        (SELECT concat_ws(',', count(*), max(pin.updated_at))
           FROM pin
          WHERE pin.app_id = ${CASHIER_APP_ID}
            AND pin.username IN (
              SELECT cashier_staff.username
                FROM cashier_staff
                JOIN merchant ON merchant.id = cashier_staff.merchant_id
               WHERE merchant.partner_id = ${partnerId}))
      )) AS version
    `);
    return row.version;
  }
}
