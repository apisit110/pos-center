import { db, merchants, eq, and, ilike, count } from '@pos-center/database';
import { IMerchantRepository, MerchantFilter } from '../../domain/repositories/IMerchantRepository';
import { Merchant } from '../../domain/entities/Merchant';

export class DrizzleMerchantRepository implements IMerchantRepository {
  async getById(uid: string): Promise<Merchant | null> {
    const result = await db.query.merchants.findFirst({
      where: eq(merchants.uid, uid),
    });

    if (!result) return null;

    return new Merchant(result.uid, result.mid, result.name);
  }

  async findAll(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions: any[] = [];

    if (filters?.mid) {
      conditions.push(ilike(merchants.mid, `%${filters.mid}%`));
    }
    if (filters?.name) {
      conditions.push(ilike(merchants.name, `%${filters.name}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db.select().from(merchants)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ value: count() }).from(merchants).where(whereClause);

    return {
      merchants: results.map(m => new Merchant(m.uid, m.mid, m.name)),
      total: Number(totalCount[0].value),
    };
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
