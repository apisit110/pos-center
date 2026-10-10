import { db } from '../index';
import { role, permission, rolePermission } from '@pos-center/models';
import { eq, and } from 'drizzle-orm';
import { PERMISSION_NAMES } from './permissions.seed';

export const PRODUCT_OWNER_ROLE = 'PRODUCT_OWNER';

export async function seedUamRoles() {
  console.log('📦 Seeding UAM roles...');

  const existingRole = await db.select({ id: role.id }).from(role).where(eq(role.name, PRODUCT_OWNER_ROLE)).limit(1);
  const roleId = existingRole[0]
    ? existingRole[0].id
    : (await db.insert(role).values({ name: PRODUCT_OWNER_ROLE }).returning({ id: role.id }))[0].id;

  const permissions = await db.select({ id: permission.id, name: permission.name }).from(permission);
  const permissionIdByName = new Map(permissions.map((p) => [p.name, p.id]));

  for (const name of PERMISSION_NAMES) {
    const permissionId = permissionIdByName.get(name);
    if (!permissionId) continue;

    const existing = await db.select().from(rolePermission)
      .where(and(eq(rolePermission.roleId, roleId), eq(rolePermission.permissionId, permissionId)))
      .limit(1);

    if (!existing[0]) {
      await db.insert(rolePermission).values({ roleId, permissionId });
    }
  }
}
