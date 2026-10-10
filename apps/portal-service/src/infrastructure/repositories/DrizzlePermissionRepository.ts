import { db, staff, staffRole, rolePermission, permission } from '@pos-center/database';
import { eq } from 'drizzle-orm';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';

export class DrizzlePermissionRepository implements IPermissionRepository {
  async getPermissionsByStaffUid(staffUid: string): Promise<string[]> {
    const rows = await db.select({ name: permission.name }).from(staff)
      .innerJoin(staffRole, eq(staffRole.staffId, staff.id))
      .innerJoin(rolePermission, eq(rolePermission.roleId, staffRole.roleId))
      .innerJoin(permission, eq(permission.id, rolePermission.permissionId))
      .where(eq(staff.uid, staffUid));
    return rows.map((row) => row.name);
  }
}
