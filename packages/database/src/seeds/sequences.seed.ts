import { db } from '../index';
import { sql } from 'drizzle-orm';

/**
 * Realigns sequences for tables populated outside of this seed script
 * (e.g. via app usage) so future inserts don't collide with existing ids.
 */
export async function resetSequences() {
  console.log('🔄 Resetting sequences...');

  await db.execute(sql`SELECT setval('merchants_id_seq', COALESCE((SELECT MAX(id) FROM merchants), 1), (SELECT MAX(id) IS NOT NULL FROM merchants))`);
  await db.execute(sql`SELECT setval('stores_id_seq', COALESCE((SELECT MAX(id) FROM stores), 1), (SELECT MAX(id) IS NOT NULL FROM stores))`);
  await db.execute(sql`SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1), (SELECT MAX(id) IS NOT NULL FROM products))`);
}
