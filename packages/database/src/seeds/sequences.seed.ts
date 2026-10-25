import { db } from '../index';
import { sql } from 'drizzle-orm';

/**
 * Realigns sequences for tables populated outside of this seed script
 * (e.g. via app usage) so future inserts don't collide with existing ids.
 */
export async function resetSequences() {
  console.log('🔄 Resetting sequences...');

  await db.execute(sql`SELECT setval('merchant_id_seq', COALESCE((SELECT MAX(id) FROM merchant), 1), (SELECT MAX(id) IS NOT NULL FROM merchant))`);
  await db.execute(sql`SELECT setval('store_id_seq', COALESCE((SELECT MAX(id) FROM store), 1), (SELECT MAX(id) IS NOT NULL FROM store))`);
  await db.execute(sql`SELECT setval('product_id_seq', COALESCE((SELECT MAX(id) FROM product), 1), (SELECT MAX(id) IS NOT NULL FROM product))`);
  await db.execute(sql`SELECT setval('master_provinces_id_seq', COALESCE((SELECT MAX(id) FROM master_provinces), 1), (SELECT MAX(id) IS NOT NULL FROM master_provinces))`);
  await db.execute(sql`SELECT setval('master_districts_id_seq', COALESCE((SELECT MAX(id) FROM master_districts), 1), (SELECT MAX(id) IS NOT NULL FROM master_districts))`);
  await db.execute(sql`SELECT setval('master_sub_districts_id_seq', COALESCE((SELECT MAX(id) FROM master_sub_districts), 1), (SELECT MAX(id) IS NOT NULL FROM master_sub_districts))`);
}
