import { db, staff, merchants } from '@lightning/database';
import { eq, or, like, sql, count } from 'drizzle-orm';
import { Staff } from '../../domain/entities/Staff';
import { IStaffRepository, StaffFilter } from '../../application/repositories/IStaffRepository';

export class DrizzleStaffRepository implements IStaffRepository {
  async getStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }> {
    const offset = (page - 1) * limit;
    
    let whereClause: any = undefined;
    
    if (filters?.merchantId) {
        // Need to join with merchants or use merchant internal ID
        // For simplicity assuming merchantId passed is the UID, but we need internal ID for the join
        const merchant = await db.select({ id: merchants.id }).from(merchants).where(eq(merchants.id, Number(filters.merchantId))).limit(1);
        if (merchant[0]) {
            whereClause = eq(staff.merchantId, merchant[0].id);
        }
    }

    if (filters?.query) {
      const queryFilter = like(staff.name, `%${filters.query}%`);
      whereClause = whereClause ? sql`${whereClause} AND ${queryFilter}` : queryFilter;
    }

    const results = await db.select().from(staff)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ value: count() }).from(staff).where(whereClause);

    // Need to get merchant UID for the Staff entity if needed, but Staff entity takes string id
    // Assuming merchantId in Staff entity is the internal ID for now, or we should map it.
    // In Staff entity: public readonly merchantId: string
    
    return {
      staff: results.map(s => new Staff(
        s.uid,
        s.merchantId.toString(),
        s.name,
        s.role as any
      )),
      total: Number(totalCount[0].value)
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
