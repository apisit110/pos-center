import {
  db,
  merchants,
  stores,
  terminals,
  mapStoreTerminal,
  cashierStaff,
  cashierStaffRole,
  cashierRole,
  pins,
  eq,
  and,
  inArray,
} from '@pos-center/database';
import {
  CashierProfileStaff,
  CashierProfileStore,
  CashierProfileTerminal,
} from '../../domain/entities/CashierProfile';
import { Merchant } from '../../domain/entities/Merchant';
import {
  ICashierProfileRepository,
  TerminalWithStore,
} from '../../domain/repositories/ICashierProfileRepository';

// docs/portal/erdiagram/pin.md: APP0001 = cashier
const CASHIER_APP_ID = 'APP0001';

export class DrizzleCashierProfileRepository implements ICashierProfileRepository {
  async findMerchantByPartnerId(partnerId: string): Promise<Merchant | null> {
    const [merchant] = await db.select().from(merchants).where(eq(merchants.partnerId, partnerId)).limit(1);
    if (!merchant) return null;
    return new Merchant(merchant.id, merchant.uid, merchant.partnerId, merchant.nameEn, merchant.nameTh);
  }

  async findTerminalWithStore(tid: string): Promise<TerminalWithStore | null> {
    const result = await db.select({
      terminal: terminals,
      store: stores,
    })
    .from(terminals)
    .innerJoin(mapStoreTerminal, eq(terminals.id, mapStoreTerminal.terminalId))
    .innerJoin(stores, eq(mapStoreTerminal.storeId, stores.id))
    .where(eq(terminals.tid, tid))
    .limit(1);

    if (!result.length) return null;

    const { terminal, store } = result[0];
    return {
      terminal: new CashierProfileTerminal(terminal.uid, terminal.tid, terminal.nameEn, terminal.nameTh),
      store: new CashierProfileStore(store.id, store.merchantId, store.uid, store.sid, store.nameEn, store.nameTh),
    };
  }

  async findStaffsByMerchantId(merchantId: number): Promise<CashierProfileStaff[]> {
    const rows = await db.select({
      staff: cashierStaff,
      roleName: cashierRole.name,
    })
    .from(cashierStaff)
    .leftJoin(cashierStaffRole, eq(cashierStaff.id, cashierStaffRole.staffId))
    .leftJoin(cashierRole, eq(cashierStaffRole.roleId, cashierRole.id))
    .where(eq(cashierStaff.merchantId, merchantId));

    // group roles by staff
    const staffById = new Map<number, { staff: typeof cashierStaff.$inferSelect; roles: string[] }>();
    for (const { staff, roleName } of rows) {
      const entry = staffById.get(staff.id) ?? { staff, roles: [] };
      if (roleName) entry.roles.push(roleName);
      staffById.set(staff.id, entry);
    }

    const usernames = [...staffById.values()]
      .map(({ staff }) => staff.username)
      .filter((username): username is string => !!username);

    const pinHashByUsername = new Map<string, string>();
    if (usernames.length) {
      const pinRows = await db.select({ username: pins.username, pinHash: pins.pinHash })
        .from(pins)
        .where(and(eq(pins.appId, CASHIER_APP_ID), inArray(pins.username, usernames)));
      for (const { username, pinHash } of pinRows) {
        pinHashByUsername.set(username, pinHash);
      }
    }

    return [...staffById.values()].map(({ staff, roles }) => new CashierProfileStaff(
      staff.uid || '',
      staff.username || '',
      staff.fullName || '',
      staff.status || '',
      roles,
      (staff.username && pinHashByUsername.get(staff.username)) || '',
      staff.updatedAt
    ));
  }
}
