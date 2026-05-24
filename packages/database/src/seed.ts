import { db } from './index';
import { merchants, stores, products, storeProducts, members, staff, runningNumbers, syncMetadata, roles, branches } from '@pos-center/models';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🌱 Setting up initial system data...');

  try {
    // 1. Seed Running Numbers
    console.log('📦 Seeding running numbers...');
    await db.insert(runningNumbers).values({
      type: 'product_version',
      number: 0
    }).onConflictDoNothing();

    await db.insert(runningNumbers).values({
      type: 'user_id',
      number: 0
    }).onConflictDoNothing();

    // 2. Seed Sync Metadata
    console.log('📦 Seeding sync metadata...');
    await db.insert(syncMetadata).values({
      lastProductSyncVersion: 0,
      status: 'IDLE'
    }).onConflictDoNothing();

    // 3. Seed Roles
    console.log('📦 Seeding roles...');
    const defaultRoles = [
      { id: 1, roleName: 'Manager', level: 1 },
      { id: 2, roleName: 'Cashier', level: 2 },
    ];
    for (const role of defaultRoles) {
      await db.insert(roles).values(role).onConflictDoUpdate({
        target: roles.id,
        set: { roleName: role.roleName, level: role.level }
      });
    }

    // 4. Seed Branches
    console.log('📦 Seeding branches...');
    const defaultBranches = [
      { id: 1, branchCode: 'B001', branchName: 'Main Branch' },
      { id: 2, branchCode: 'B002', branchName: 'Second Branch' },
    ];
    for (const branch of defaultBranches) {
      await db.insert(branches).values(branch).onConflictDoUpdate({
        target: branches.id,
        set: { branchCode: branch.branchCode, branchName: branch.branchName }
      });
    }

    console.log('🔄 Resetting sequences...');
    await db.execute(sql`SELECT setval('merchants_id_seq', COALESCE((SELECT MAX(id) FROM merchants), 1), (SELECT MAX(id) IS NOT NULL FROM merchants))`);
    await db.execute(sql`SELECT setval('stores_id_seq', COALESCE((SELECT MAX(id) FROM stores), 1), (SELECT MAX(id) IS NOT NULL FROM stores))`);
    await db.execute(sql`SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1), (SELECT MAX(id) IS NOT NULL FROM products))`);
    await db.execute(sql`SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 1), (SELECT MAX(id) IS NOT NULL FROM roles))`);
    await db.execute(sql`SELECT setval('branches_id_seq', COALESCE((SELECT MAX(id) FROM branches), 1), (SELECT MAX(id) IS NOT NULL FROM branches))`);

    console.log('✅ System setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ System setup failed:', error);
    process.exit(1);
  }
}

seed();
