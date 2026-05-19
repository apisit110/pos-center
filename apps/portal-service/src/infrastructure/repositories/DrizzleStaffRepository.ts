import { db, staff, merchants } from '@lightning/database';
import { eq, like, and, count, gte, lte } from 'drizzle-orm';
import { Staff } from '../../domain/entities/Staff';
import { IStaffRepository, StaffFilter } from '../../application/repositories/IStaffRepository';

export class DrizzleStaffRepository implements IStaffRepository {
  async getStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }> {
    const offset = (page - 1) * limit;
    const conditions: any[] = [];

    if (filters?.merchantId) {
      const merchant = await db.select({ id: merchants.id }).from(merchants)
        .where(eq(merchants.uid, filters.merchantId)).limit(1);
      if (merchant[0]) {
        conditions.push(eq(staff.merchantId, merchant[0].id));
      }
    }

    if (filters?.role) {
      conditions.push(eq(staff.role, filters.role));
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
      conditions.push(gte(staff.createdAt, new Date(filters.startDate)));
    }

    if (filters?.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(staff.createdAt, end));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db.select({
      uid: staff.uid,
      merchantId: staff.merchantId,
      merchantName: merchants.name,
      name: staff.name,
      role: staff.role,
      username: staff.username,
      status: staff.status,
      createdAt: staff.createdAt,
    }).from(staff)
      .leftJoin(merchants, eq(staff.merchantId, merchants.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ value: count() }).from(staff)
      .leftJoin(merchants, eq(staff.merchantId, merchants.id))
      .where(whereClause);

    return {
      staff: results.map(s => new Staff(
        s.uid,
        s.merchantId.toString(),
        s.name,
        s.role as any,
        s.username ?? undefined,
        undefined,
        (s.status ?? 'active') as any,
        s.createdAt ?? undefined,
        s.merchantName ?? undefined,
      )),
      total: Number(totalCount[0].value),
    };
  }

  async getStaffByMerchant(merchantUid: string): Promise<Staff[]> {
    const merchant = await db.select({ id: merchants.id }).from(merchants).where(eq(merchants.uid, merchantUid)).limit(1);
    if (!merchant[0]) return [];

    const results = await db.select({
      uid: staff.uid,
      name: staff.name,
      role: staff.role,
      username: staff.username,
      status: staff.status,
    }).from(staff).where(eq(staff.merchantId, merchant[0].id));

    return results.map(s => new Staff(
      s.uid,
      merchantUid,
      s.name,
      s.role as any,
      s.username ?? undefined,
      undefined,
      (s.status ?? 'active') as any,
    ));
  }

  async getStaffById(id: string): Promise<Staff | null> {
    const result = await db.select().from(staff).where(eq(staff.uid, id)).limit(1);
    if (!result[0]) return null;
    
    const s = result[0];
    return new Staff(
      s.uid,
      s.merchantId.toString(),
      s.name,
      s.role as any
    );
  }

  async save(staffMember: Staff): Promise<void> {
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.uid, staffMember.merchantId)
    });

    if (!merchant) throw new Error('Merchant not found');

    await db.insert(staff).values({
      uid: staffMember.id,
      merchantId: merchant.id,
      name: staffMember.name,
      role: staffMember.role,
      username: staffMember.username,
      pinHash: staffMember.pinHash,
      status: staffMember.status,
    }).onConflictDoUpdate({
      target: staff.uid,
      set: {
        name: staffMember.name,
        role: staffMember.role,
        username: staffMember.username,
        pinHash: staffMember.pinHash,
        status: staffMember.status,
      }
    });
  }
}
