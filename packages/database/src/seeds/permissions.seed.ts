import { db } from '../index';
import { permission } from '@pos-center/models';
import { eq } from 'drizzle-orm';

export const PERMISSION_NAMES = [
  'me:get_profile',
  'dashboard:view',
  'merchants:view',
  'merchants:create',
  'merchant_detail:view',
  'stores:view',
  'stores:create',
  'store_detail:view',
  'products:view',
  'products:create',
  'product_detail:view',
  'staffs:view',
  'staffs:create',
  'staff_detail:view',
  'transactions:view',
  'transaction_detail:view',
  'terminals:view',
  'terminals:create',
];

export async function seedPermissions() {
  console.log('📦 Seeding permissions...');

  for (const name of PERMISSION_NAMES) {
    const existing = await db.select({ id: permission.id }).from(permission).where(eq(permission.name, name)).limit(1);
    if (!existing[0]) {
      await db.insert(permission).values({ name });
    }
  }
}
