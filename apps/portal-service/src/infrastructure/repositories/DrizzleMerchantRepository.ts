import { db, merchants, eq } from '@lightning/database';
import { IMerchantRepository } from '../../application/repositories/IMerchantRepository';
import { Merchant } from '../../domain/entities/Merchant';

export class DrizzleMerchantRepository implements IMerchantRepository {
  async getById(uid: string): Promise<Merchant | null> {
    const result = await db.query.merchants.findFirst({
      where: eq(merchants.uid, uid),
    });

    if (!result) return null;

    return new Merchant(result.uid, result.mid, result.name);
  }

  async findAll(): Promise<Merchant[]> {
    const results = await db.select().from(merchants);
    return results.map(m => new Merchant(m.uid, m.mid, m.name));
  }

  async save(merchant: Merchant): Promise<void> {
    // Basic implementation for now
    await db.insert(merchants).values({
      uid: merchant.uid,
      mid: merchant.mid,
      name: merchant.name,
    }).onConflictDoUpdate({
      target: merchants.uid,
      set: { 
        name: merchant.name,
        mid: merchant.mid
      },
    });
  }
}
