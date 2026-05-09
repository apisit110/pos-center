import { db, merchants, eq } from '@lightning/database';
import { IMerchantRepository } from '../../application/repositories/IMerchantRepository';
import { Merchant } from '../../domain/entities/Merchant';

export class DrizzleMerchantRepository implements IMerchantRepository {
  async getById(id: string): Promise<Merchant | null> {
    const result = await db.query.merchants.findFirst({
      where: eq(merchants.uid, id),
    });

    if (!result) return null;

    return new Merchant(result.uid, result.name);
  }

  async findAll(): Promise<Merchant[]> {
    const results = await db.select().from(merchants);
    return results.map(m => new Merchant(m.uid, m.name));
  }

  async save(merchant: Merchant): Promise<void> {
    // Basic implementation for now
    await db.insert(merchants).values({
      uid: merchant.id,
      name: merchant.name,
    }).onConflictDoUpdate({
      target: merchants.uid,
      set: { name: merchant.name },
    });
  }
}
