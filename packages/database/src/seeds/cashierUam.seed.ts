import { db } from '../index';
import { cashierRole, cashierPermission, cashierRolePermission } from '@pos-center/models';
import { eq, and } from 'drizzle-orm';

// docs/portal/uam.md "UAM Cashier". Guest is the user before login, not a cashier_role, so it is not seeded.
export const CASHIER_UAM: Record<string, { manager: boolean; cashier: boolean }> = {
  'login': { manager: false, cashier: false },
  'dashboard:view': { manager: true, cashier: false },
  'sell:create': { manager: true, cashier: true },
  'transaction:view': { manager: true, cashier: false },
  'products:view': { manager: true, cashier: false },
  'product:create': { manager: true, cashier: false },
  'product:edit': { manager: true, cashier: false },
  'products:sync': { manager: true, cashier: false },
  'staff:view': { manager: true, cashier: false },
  'staff:create': { manager: true, cashier: false },
};

export const CASHIER_ROLES = ['manager', 'cashier'] as const;

export async function seedCashierUam() {
  console.log('📦 Seeding cashier UAM...');

  for (const name of Object.keys(CASHIER_UAM)) {
    const existing = await db.select({ id: cashierPermission.id }).from(cashierPermission).where(eq(cashierPermission.name, name)).limit(1);
    if (!existing[0]) {
      await db.insert(cashierPermission).values({ name });
    }
  }

  for (const roleName of CASHIER_ROLES) {
    const existingRole = await db.select({ id: cashierRole.id }).from(cashierRole).where(eq(cashierRole.name, roleName)).limit(1);
    const roleId = existingRole[0]
      ? existingRole[0].id
      : (await db.insert(cashierRole).values({ name: roleName }).returning({ id: cashierRole.id }))[0].id;

    for (const [permissionKey, grants] of Object.entries(CASHIER_UAM)) {
      const isGranted = grants[roleName];
      const existing = await db.select({ id: cashierRolePermission.id }).from(cashierRolePermission)
        .where(and(eq(cashierRolePermission.roleId, roleId), eq(cashierRolePermission.permissionKey, permissionKey)))
        .limit(1);

      // keep the table in line with the matrix when the seed runs again
      if (existing[0]) {
        await db.update(cashierRolePermission).set({ isGranted }).where(eq(cashierRolePermission.id, existing[0].id));
      } else {
        await db.insert(cashierRolePermission).values({ roleId, permissionKey, isGranted });
      }
    }
  }
}
