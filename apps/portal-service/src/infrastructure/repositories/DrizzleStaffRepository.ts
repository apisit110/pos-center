import { db, staff, role, staffRole } from '@pos-center/database';
import { eq } from 'drizzle-orm';
import { Staff } from '../../domain/entities/Staff';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';

export class DrizzleStaffRepository implements IStaffRepository {
  async getMerchantUidByStaffId(_staffId: string): Promise<string | null> {
    // center_staff is not merchant-scoped, so a center staff never has an own merchant
    return null;
  }

  async getStaffByUid(uid: string): Promise<Staff | null> {
    return this.findOne(eq(staff.uid, uid));
  }

  async getStaffByUsername(username: string): Promise<Staff | null> {
    return this.findOne(eq(staff.username, username));
  }

  private async findOne(condition: ReturnType<typeof eq>): Promise<Staff | null> {
    const result = await db.select({
      uid: staff.uid,
      name: staff.fullName,
      username: staff.username,
      role: role.name,
      status: staff.status,
      createdAt: staff.createdAt,
    }).from(staff)
      .leftJoin(staffRole, eq(staffRole.staffId, staff.id))
      .leftJoin(role, eq(role.id, staffRole.roleId))
      .where(condition).limit(1);
    if (!result[0]) return null;

    const s = result[0];
    return new Staff(
      s.uid,
      '',
      s.name ?? '',
      (s.role ?? 'cashier') as any,
      s.username,
      undefined,
      s.status,
      s.createdAt,
    );
  }
}
