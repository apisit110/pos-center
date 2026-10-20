import { merchantUidIs } from '../utils/merchant';
import { db, merchants, stores as storesTable, terminals as terminalsTable, staff as staffTable, staffRole, pins, role, eq, and, ilike, count, asc } from '@pos-center/database';
import { PORTAL_APP_ID } from '../../domain/constants/app';
import { Staff } from '../../domain/entities/Staff';
import { Store } from '../../domain/entities/Store';
import { Terminal } from '../../domain/entities/Terminal';
import { IMerchantRepository, MerchantFilter } from '../../domain/repositories/IMerchantRepository';
import { Merchant } from '../../domain/entities/Merchant';

export class DrizzleMerchantRepository implements IMerchantRepository {
  async getById(uid: string): Promise<Merchant | null> {
    const result = await db.query.merchants.findFirst({
      where: merchantUidIs(uid),
    });

    if (!result) return null;

    return new Merchant(result.uid, result.mid, result.name);
  }

  async getByMid(mid: string): Promise<Merchant | null> {
    const result = await db.query.merchants.findFirst({
      where: eq(merchants.mid, mid),
    });

    if (!result) return null;

    return new Merchant(result.uid, result.mid, result.name);
  }

  async findAll(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions: any[] = [];

    if (filters?.mid) {
      conditions.push(ilike(merchants.mid, `%${filters.mid}%`));
    }
    if (filters?.name) {
      conditions.push(ilike(merchants.name, `%${filters.name}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db.select().from(merchants)
      .where(whereClause)
      .orderBy(asc(merchants.id))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ value: count() }).from(merchants).where(whereClause);

    return {
      merchants: results.map(m => new Merchant(m.uid, m.mid, m.name)),
      total: Number(totalCount[0].value),
    };
  }

  async save(merchant: Merchant): Promise<void> {
    // Basic implementation for now
    await db.insert(merchants).values({
      uid: merchant.uid,
      mid: merchant.mid,
      name: merchant.name,
    }).onConflictDoUpdate({
      target: merchants.uid,
      set: { 
        name: merchant.name,
        mid: merchant.mid
      },
    });
  }

  async createWithMembers(
    merchant: Merchant,
    staffMembers: Staff[],
    stores: { store: Store; terminals: Terminal[] }[],
  ): Promise<void> {
    await db.transaction(async (tx) => {
      const [insertedMerchant] = await tx.insert(merchants).values({
        uid: merchant.uid,
        mid: merchant.mid,
        name: merchant.name,
      }).returning({ id: merchants.id });

      for (const member of staffMembers) {
        const [insertedStaff] = await tx.insert(staffTable).values({
          uid: member.id,
          merchantId: insertedMerchant.id,
          name: member.name,
          username: member.username,
          status: member.status,
        }).returning({ id: staffTable.id });

        const existingRole = await tx.select({ id: role.id }).from(role).where(eq(role.name, member.role)).limit(1);
        const roleId = existingRole[0]
          ? existingRole[0].id
          : (await tx.insert(role).values({ name: member.role }).returning({ id: role.id }))[0].id;
        await tx.insert(staffRole).values({ staffId: insertedStaff.id, roleId });

        if (member.pinHash && member.username) {
          await tx.insert(pins).values({ appId: PORTAL_APP_ID, username: member.username, pinHash: member.pinHash });
        }
      }

      for (const { store, terminals } of stores) {
        const [insertedStore] = await tx.insert(storesTable).values({
          uid: store.uid,
          sid: store.sid,
          merchantId: insertedMerchant.id,
          name: store.name,
          address: store.address,
          latitude: store.latitude.toString(),
          longitude: store.longitude.toString(),
        }).returning({ id: storesTable.id });

        for (const terminal of terminals) {
          await tx.insert(terminalsTable).values({
            uid: terminal.id,
            storeId: insertedStore.id,
            tid: terminal.tid,
            name: terminal.name,
          });
        }
      }
    });
  }
}
