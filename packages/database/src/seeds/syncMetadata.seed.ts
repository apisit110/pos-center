import { db } from '../index';
import { syncMetadata } from '@pos-center/models';

export async function seedSyncMetadata() {
  console.log('📦 Seeding sync metadata...');

  await db.insert(syncMetadata).values({
    lastProductSyncVersion: 0,
    status: 'IDLE'
  }).onConflictDoNothing();
}
