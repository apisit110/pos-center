import { db, brands, inArray, sql } from '@pos-center/database';
import { Brand } from '../../domain/entities/Product';
import { IBrandRepository } from '../../domain/repositories/IBrandRepository';

export class DrizzleBrandRepository implements IBrandRepository {
  async upsertMany(brandList: Brand[]): Promise<{ created: number; updated: number }> {
    if (brandList.length === 0) return { created: 0, updated: 0 };

    return db.transaction(async (tx) => {
      const existing = await tx.select({ uid: brands.uid })
        .from(brands)
        .where(inArray(brands.uid, brandList.map((b) => b.uid)));
      const existingUids = new Set(existing.map((b) => b.uid));

      await tx.insert(brands)
        .values(brandList.map((b) => ({ uid: b.uid, nameEn: b.nameEn, nameTh: b.nameTh })))
        .onConflictDoUpdate({
          target: brands.uid,
          set: { nameEn: sql`excluded.name_en`, nameTh: sql`excluded.name_th`, updatedAt: new Date() },
        });

      const updated = brandList.filter((b) => existingUids.has(b.uid)).length;
      return { created: brandList.length - updated, updated };
    });
  }
}
