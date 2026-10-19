import { merchantUidIs } from '../utils/merchant';
import { db, staff, merchants, pins, role, staffRole } from '@pos-center/database';
import { eq, like, and, count, gte, lte, desc, SQL } from 'drizzle-orm';
import { Staff } from '../../domain/entities/Staff';
import { IStaffRepository, StaffFilter } from '../../domain/repositories/IStaffRepository';
import { PORTAL_APP_ID } from '../../domain/constants/app';

const MAX_MERCHANT_SCOPED_RESULTS = 500;

async function getOrCreateRoleId(roleName: string, tx: typeof db = db): Promise<number> {
  const existing = await tx.select({ id: role.id }).from(role).where(eq(role.name, roleName)).limit(1);
  if (existing[0]) return existing[0].id;

  const inserted = await tx.insert(role).values({ name: roleName }).returning({ id: role.id });
  return inserted[0].id;
}

export class DrizzleStaffRepository implements IStaffRepository {
  async getStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }> {
    const offset = (page - 1) * limit;
    const conditions: SQL[] = [];

    if (filters?.merchantUid) {
      conditions.push(merchantUidIs(filters.merchantUid));
    }

    if (filters?.role) {
      conditions.push(eq(role.name, filters.role));
    }

    if (filters?.username) {
      conditions.push(like(staff.username, `%${filters.username}%`));
    }

    if (filters?.status) {
      conditions.push(eq(staff.status, filters.status));
    }

    if (filters?.query) {
      conditions.push(like(staff.name, `%${filters.query}%`));
    }

    if (filters?.startDate) {
      conditions.push(gte(staff.createdAt, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(staff.createdAt, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db.select({
      uid: staff.uid,
      merchantUid: merchants.uid,
      merchantName: merchants.name,
      name: staff.name,
      role: role.name,
      username: staff.username,
      status: staff.status,
      createdAt: staff.createdAt,
    }).from(staff)
      .innerJoin(merchants, eq(staff.merchantId, merchants.id))
      .leftJoin(staffRole, eq(staffRole.staffId, staff.id))
      .leftJoin(role, eq(role.id, staffRole.roleId))
      .where(whereClause)
      .orderBy(desc(staff.id))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ value: count() }).from(staff)
      .innerJoin(merchants, eq(staff.merchantId, merchants.id))
      .leftJoin(staffRole, eq(staffRole.staffId, staff.id))
      .leftJoin(role, eq(role.id, staffRole.roleId))
      .where(whereClause);

    return {
      staff: results.map(s => new Staff(
        s.uid,
        s.merchantUid,
        s.name,
        (s.role ?? 'cashier') as any,
        s.username ?? undefined,
        undefined,
        (s.status ?? 'ACTIVE') as any,
        s.createdAt ?? undefined,
        s.merchantName,
      )),
      total: Number(totalCount[0].value),
    };
  }

  async getStaffByMerchant(merchantUid: string): Promise<Staff[]> {
    const merchant = await db.select({ id: merchants.id }).from(merchants).where(merchantUidIs(merchantUid)).limit(1);
    if (!merchant[0]) return [];

    const results = await db.select({
      uid: staff.uid,
      name: staff.name,
      role: role.name,
      username: staff.username,
      status: staff.status,
    }).from(staff)
      .leftJoin(staffRole, eq(staffRole.staffId, staff.id))
      .leftJoin(role, eq(role.id, staffRole.roleId))
      .where(eq(staff.merchantId, merchant[0].id))
      .limit(MAX_MERCHANT_SCOPED_RESULTS);

    return results.map(s => new Staff(
      s.uid,
      merchantUid,
      s.name,
      (s.role ?? 'cashier') as any,
      s.username ?? undefined,
      undefined,
      (s.status ?? 'ACTIVE') as any,
    ));
  }

  async getMerchantUidByStaffId(staffId: string): Promise<string | null> {
    const result = await db.select({ merchantUid: merchants.uid }).from(staff)
      .innerJoin(merchants, eq(staff.merchantId, merchants.id))
      .where(eq(staff.uid, staffId)).limit(1);
    return result[0]?.merchantUid ?? null;
  }

  async getStaffByUid(uid: string): Promise<Staff | null> {
    return this.findOneWithMerchantUid(eq(staff.uid, uid));
  }

  async getStaffByUsername(username: string): Promise<Staff | null> {
    return this.findOneWithMerchantUid(eq(staff.username, username));
  }

  private async findOneWithMerchantUid(condition: ReturnType<typeof eq>): Promise<Staff | null> {
    const result = await db.select({
      uid: staff.uid,
      merchantUid: merchants.uid,
      merchantName: merchants.name,
      name: staff.name,
      username: staff.username,
      role: role.name,
      status: staff.status,
      createdAt: staff.createdAt,
    }).from(staff)
      .innerJoin(merchants, eq(staff.merchantId, merchants.id))
      .leftJoin(staffRole, eq(staffRole.staffId, staff.id))
      .leftJoin(role, eq(role.id, staffRole.roleId))
      .where(condition).limit(1);
    if (!result[0]) return null;

    const s = result[0];
    return new Staff(
      s.uid,
      s.merchantUid,
      s.name,
      (s.role ?? 'cashier') as any,
      s.username ?? undefined,
      undefined,
      (s.status ?? 'ACTIVE') as any,
      s.createdAt ?? undefined,
      s.merchantName,
    );
  }

  async save(staffMember: Staff): Promise<void> {
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.uid, staffMember.merchantId)
    });

    if (!merchant) throw new Error('Merchant not found');

    await db.transaction(async (tx) => {
      const existing = await tx.select({ id: staff.id }).from(staff).where(eq(staff.uid, staffMember.id)).limit(1);

      let staffId: number;
      if (existing[0]) {
        staffId = existing[0].id;
        await tx.update(staff).set({
          name: staffMember.name,
          username: staffMember.username,
          status: staffMember.status,
          updatedAt: new Date(),
        }).where(eq(staff.id, staffId));
      } else {
        const inserted = await tx.insert(staff).values({
          uid: staffMember.id,
          merchantId: merchant.id,
          name: staffMember.name,
          username: staffMember.username,
          status: staffMember.status,
        }).returning({ id: staff.id });
        staffId = inserted[0].id;
      }

      const roleId = await getOrCreateRoleId(staffMember.role, tx as unknown as typeof db);

      await tx.insert(staffRole).values({
        staffId,
        roleId,
      }).onConflictDoUpdate({
        target: staffRole.staffId,
        set: { roleId, updatedAt: new Date() },
      });

      if (staffMember.pinHash && staffMember.username) {
        const existingPin = await tx.select({ id: pins.id }).from(pins)
          .where(and(eq(pins.username, staffMember.username), eq(pins.appId, PORTAL_APP_ID))).limit(1);

        if (existingPin[0]) {
          await tx.update(pins).set({
            pinHash: staffMember.pinHash,
            updatedAt: new Date(),
          }).where(eq(pins.id, existingPin[0].id));
        } else {
          await tx.insert(pins).values({
            appId: PORTAL_APP_ID,
            username: staffMember.username,
            pinHash: staffMember.pinHash,
          });
        }
      }
    });
  }
}
