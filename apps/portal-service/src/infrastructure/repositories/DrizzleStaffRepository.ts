import { db, staff, merchants } from '@lightning/database';
import { eq, or, like, sql, count } from 'drizzle-orm';
import { Staff } from '../../domain/entities/Staff';
import { StaffRepository, StaffFilter } from '../../application/repositories/StaffRepository';

export class DrizzleStaffRepository implements StaffRepository {
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
        s.role
      )),
      total: Number(totalCount[0].value)
    };
  }

  async getStaffById(id: string): Promise<Staff | null> {
    const result = await db.select().from(staff).where(eq(staff.uid, id)).limit(1);
    if (!result[0]) return null;
    
    const s = result[0];
    return new Staff(
      s.uid,
      s.merchantId.toString(),
      s.name,
      s.role
    );
  }
}
