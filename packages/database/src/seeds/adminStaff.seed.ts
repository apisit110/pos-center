import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { db } from '../index';
import { merchants, staff, role, staffRole, pins } from '@pos-center/models';
import { eq, and } from 'drizzle-orm';
import { PRODUCT_OWNER_ROLE } from './uamRoles.seed';

const PORTAL_APP_ID = 'APP0001';
const SYSTEM_MERCHANT_MID = 'SYSTEM';
const ADMIN_USERNAME = 'admin';
const ADMIN_PIN = '123456';

export async function seedAdminStaff() {
  console.log('📦 Seeding admin staff...');

  const existingMerchant = await db.select({ id: merchants.id }).from(merchants)
    .where(eq(merchants.mid, SYSTEM_MERCHANT_MID)).limit(1);
  const merchantId = existingMerchant[0]
    ? existingMerchant[0].id
    : (await db.insert(merchants).values({ mid: SYSTEM_MERCHANT_MID, name: 'System' }).returning({ id: merchants.id }))[0].id;

  const existingStaff = await db.select({ id: staff.id }).from(staff)
    .where(eq(staff.username, ADMIN_USERNAME)).limit(1);
  const staffId = existingStaff[0]
    ? existingStaff[0].id
    : (await db.insert(staff).values({
        uid: randomUUID(),
        merchantId,
        name: 'Admin',
        username: ADMIN_USERNAME,
        status: 'ACTIVE',
      }).returning({ id: staff.id }))[0].id;

  const productOwnerRole = await db.select({ id: role.id }).from(role)
    .where(eq(role.name, PRODUCT_OWNER_ROLE)).limit(1);
  if (!productOwnerRole[0]) {
    throw new Error(`Role ${PRODUCT_OWNER_ROLE} not found. Seed UAM roles first.`);
  }
  const roleId = productOwnerRole[0].id;

  await db.insert(staffRole).values({ staffId, roleId }).onConflictDoUpdate({
    target: staffRole.staffId,
    set: { roleId, updatedAt: new Date() },
  });

  const pinHash = await bcrypt.hash(ADMIN_PIN, 10);
  const existingPin = await db.select({ id: pins.id }).from(pins)
    .where(and(eq(pins.username, ADMIN_USERNAME), eq(pins.appId, PORTAL_APP_ID))).limit(1);

  if (existingPin[0]) {
    await db.update(pins).set({ pinHash, updatedAt: new Date() }).where(eq(pins.id, existingPin[0].id));
  } else {
    await db.insert(pins).values({ appId: PORTAL_APP_ID, username: ADMIN_USERNAME, pinHash });
  }
}
