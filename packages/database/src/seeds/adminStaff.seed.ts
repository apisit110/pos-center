import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { db } from '../index';
import { staff, role, staffRole, pins } from '@pos-center/models';
import { eq, and } from 'drizzle-orm';
import { PRODUCT_OWNER_ROLE } from './uamRoles.seed';

// docs/portal/erdiagram/pin.md: APP0002 = center
const PORTAL_APP_ID = 'APP0002';
const LEGACY_ADMIN_APP_ID = 'APP0001';
const ADMIN_USERNAME = 'admin';
const ADMIN_PIN = '123456';

export async function seedAdminStaff() {
  console.log('📦 Seeding admin staff...');

  const existingStaff = await db.select({ id: staff.id }).from(staff)
    .where(eq(staff.username, ADMIN_USERNAME)).limit(1);
  const staffId = existingStaff[0]
    ? existingStaff[0].id
    : (await db.insert(staff).values({
        uid: randomUUID(),
        fullName: 'Admin',
        username: ADMIN_USERNAME,
        status: 'ACTIVE',
      }).returning({ id: staff.id }))[0].id;

  const productOwnerRole = await db.select({ id: role.id }).from(role)
    .where(eq(role.name, PRODUCT_OWNER_ROLE)).limit(1);
  if (!productOwnerRole[0]) {
    throw new Error(`Role ${PRODUCT_OWNER_ROLE} not found. Seed UAM roles first.`);
  }
  const roleId = productOwnerRole[0].id;

  await db.insert(staffRole).values({ staffId, roleId }).onConflictDoNothing({
    target: [staffRole.staffId, staffRole.roleId],
  });

  const pinHash = await bcrypt.hash(ADMIN_PIN, 10);
  const existingPin = await db.select({ id: pins.id }).from(pins)
    .where(and(eq(pins.username, ADMIN_USERNAME), eq(pins.appId, PORTAL_APP_ID))).limit(1);

  if (existingPin[0]) {
    await db.update(pins).set({ pinHash, updatedAt: new Date() }).where(eq(pins.id, existingPin[0].id));
  } else {
    await db.insert(pins).values({ uuid: randomUUID(), appId: PORTAL_APP_ID, username: ADMIN_USERNAME, pinHash });
  }

  // the admin pin used to be stored with the cashier app id; remove it so the admin only has a center pin
  await db.delete(pins).where(and(eq(pins.username, ADMIN_USERNAME), eq(pins.appId, LEGACY_ADMIN_APP_ID)));
}
