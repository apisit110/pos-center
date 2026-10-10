import { db } from '../index';
import { runningNumbers } from '@pos-center/models';

export async function seedRunningNumbers() {
  console.log('📦 Seeding running numbers...');

  await db.insert(runningNumbers).values({
    type: 'product_version',
    number: 0
  }).onConflictDoNothing();

  await db.insert(runningNumbers).values({
    type: 'user_id',
    number: 0
  }).onConflictDoNothing();
}
