import { and, db, eq, inArray, merchants, products, runningNumbers, sql, storeProducts, stores } from '@pos-center/database';
import {
  BatchUpsertResult,
  IStoreProductRepository,
  UpsertStoreProductByUidInput
} from '../../domain/repositories/IStoreProductRepository';

export class DrizzleStoreProductRepository implements IStoreProductRepository {
  async batchUpsertByUids(inputs: UpsertStoreProductByUidInput[], onlyMerchantUid?: string): Promise<BatchUpsertResult> {
    if (inputs.length === 0) return { created: 0, updated: 0, errors: [] };

    const storeUids = [...new Set(inputs.map((i) => i.storeUid))];
    const productUids = [...new Set(inputs.map((i) => i.productUid))];

    const [storeRows, productRows] = await Promise.all([
      db.select({ id: stores.id, uid: stores.uid, merchantUid: merchants.uid })
        .from(stores)
        .innerJoin(merchants, eq(stores.merchantId, merchants.id))
        .where(inArray(stores.uid, storeUids)),
      db.select({ id: products.id, uid: products.uid, merchantUid: merchants.uid })
        .from(products)
        .innerJoin(merchants, eq(products.merchantId, merchants.id))
        .where(inArray(products.uid, productUids)),
    ]);

    const storeMap = new Map(storeRows.map((s) => [s.uid, s]));
    const productMap = new Map(productRows.map((p) => [p.uid, p]));

    type ValidItem = { input: UpsertStoreProductByUidInput; storeId: number; productId: number };
    const valid: ValidItem[] = [];
    const errors: BatchUpsertResult['errors'] = [];

    for (const [index, input] of inputs.entries()) {
      const store = storeMap.get(input.storeUid);
      const product = productMap.get(input.productUid);
      if (!store) {
        errors.push({ index, code: 'STORE_NOT_FOUND', uid: input.storeUid });
        continue;
      }
      if (!product) {
        errors.push({ index, code: 'PRODUCT_NOT_FOUND', uid: input.productUid });
        continue;
      }
      if (onlyMerchantUid !== undefined && (store.merchantUid !== onlyMerchantUid || product.merchantUid !== onlyMerchantUid)) {
        errors.push({ index, code: 'FORBIDDEN' });
        continue;
      }
      valid.push({ input, storeId: store.id, productId: product.id });
    }

    if (valid.length === 0) return { created: 0, updated: 0, errors };

    const storeIds = [...new Set(valid.map((v) => v.storeId))];
    const productIds = [...new Set(valid.map((v) => v.productId))];

    let created = 0;
    let updated = 0;

    await db.transaction(async (tx) => {
      // one new product_version for the whole chunk, so pos can sync the changed store products
      const [version] = await tx.insert(runningNumbers)
        .values({ type: 'product_version', number: 1 })
        .onConflictDoUpdate({
          target: runningNumbers.type,
          set: { number: sql`${runningNumbers.number} + 1`, updatedAt: new Date() },
        })
        .returning({ newVersion: runningNumbers.number });
      const syncVersion = version.newVersion;

      const existingRows = await tx
        .select({ storeId: storeProducts.storeId, productId: storeProducts.productId })
        .from(storeProducts)
        .where(
          and(
            inArray(storeProducts.storeId, storeIds),
            inArray(storeProducts.productId, productIds)
          )
        );

      const existingKeys = new Set(existingRows.map((r) => `${r.storeId}:${r.productId}`));
      const pendingInserts = new Map<string, typeof storeProducts.$inferInsert>();

      for (const item of valid) {
        const key = `${item.storeId}:${item.productId}`;
        const pending = pendingInserts.get(key);

        if (existingKeys.has(key)) {
          await tx
            .update(storeProducts)
            .set({
              stock: item.input.stock,
              price: item.input.price.toString(),
              syncVersion,
              updatedAt: new Date(),
            })
            .where(and(eq(storeProducts.storeId, item.storeId), eq(storeProducts.productId, item.productId)));
          updated++;
        } else if (pending) {
          // same (store, product) twice in one chunk: the later row wins, like a row of the next chunk would
          pending.stock = item.input.stock;
          pending.price = item.input.price.toString();
          updated++;
        } else {
          pendingInserts.set(key, {
            storeId: item.storeId,
            productId: item.productId,
            stock: item.input.stock,
            price: item.input.price.toString(),
            syncVersion,
          });
          created++;
        }
      }

      if (pendingInserts.size > 0) {
        await tx.insert(storeProducts).values([...pendingInserts.values()]);
      }
    });

    return { created, updated, errors };
  }
}
