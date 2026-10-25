import { merchantUidIs } from '../utils/merchant';
import { db, cashierStaff, cashierRole, cashierStaffRole, merchants } from '@pos-center/database';
import { eq, like, and, count, gte, lte, desc, isNotNull, SQL } from 'drizzle-orm';
import { Staff } from '../../domain/entities/Staff';
import { ICashierStaffRepository, StaffFilter } from '../../domain/repositories/ICashierStaffRepository';

const MAX_MERCHANT_SCOPED_RESULTS = 500;

const selectStaff = () => db.select({
  uid: cashierStaff.uid,
  merchantUid: merchants.uid,
  merchantNameEn: merchants.nameEn,
  merchantNameTh: merchants.nameTh,
  name: cashierStaff.fullName,
  role: cashierRole.name,
  username: cashierStaff.username,
  status: cashierStaff.status,
  createdAt: cashierStaff.createdAt,
}).from(cashierStaff)
  .innerJoin(merchants, eq(cashierStaff.merchantId, merchants.id))
  .leftJoin(cashierStaffRole, eq(cashierStaffRole.staffId, cashierStaff.id))
  .leftJoin(cashierRole, eq(cashierRole.id, cashierStaffRole.roleId));

type StaffRow = Awaited<ReturnType<typeof selectStaff>>[number];

const toStaff = (s: StaffRow): Staff => new Staff(
  s.uid ?? '',
  s.merchantUid ?? '',
  s.name ?? '',
  (s.role ?? 'cashier') as any,
  s.username ?? undefined,
  undefined,
  (s.status ?? 'PENDING') as any,
  s.createdAt ?? undefined,
  s.merchantNameEn ?? '',
  s.merchantNameTh ?? '',
);

export class DrizzleCashierStaffRepository implements ICashierStaffRepository {
  async getStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }> {
    const offset = (page - 1) * limit;
    const conditions: SQL[] = [];

    if (filters?.merchantUid) {
      conditions.push(merchantUidIs(filters.merchantUid));
    }
    if (filters?.role) {
      conditions.push(eq(cashierRole.name, filters.role));
    }
    if (filters?.username) {
      conditions.push(like(cashierStaff.username, `%${filters.username}%`));
    }
    if (filters?.status) {
      conditions.push(eq(cashierStaff.status, filters.status as any));
    }
    if (filters?.query) {
      conditions.push(like(cashierStaff.fullName, `%${filters.query}%`));
    }
    if (filters?.startDate) {
      conditions.push(gte(cashierStaff.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(cashierStaff.createdAt, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await selectStaff()
      .where(whereClause)
      .orderBy(desc(cashierStaff.id))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ value: count() }).from(cashierStaff)
      .innerJoin(merchants, eq(cashierStaff.merchantId, merchants.id))
      .leftJoin(cashierStaffRole, eq(cashierStaffRole.staffId, cashierStaff.id))
      .leftJoin(cashierRole, eq(cashierRole.id, cashierStaffRole.roleId))
      .where(whereClause);

    return {
      staff: results.map(toStaff),
      total: Number(totalCount[0].value),
    };
  }

  async getStaffByMerchant(merchantUid: string): Promise<Staff[]> {
    const results = await selectStaff()
      .where(merchantUidIs(merchantUid))
      .limit(MAX_MERCHANT_SCOPED_RESULTS);
    return results.map(toStaff);
  }

  async getStaffByUid(uid: string): Promise<Staff | null> {
    const result = await selectStaff().where(eq(cashierStaff.uid, uid)).limit(1);
    return result[0] ? toStaff(result[0]) : null;
  }

  async getRoleIdsByName(): Promise<Map<string, number>> {
    const rows = await db.select({ id: cashierRole.id, name: cashierRole.name })
      .from(cashierRole)
      .where(isNotNull(cashierRole.name));
    return new Map(rows.map((r) => [r.name!, r.id]));
  }
}
