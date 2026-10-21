import { randomUUID } from 'crypto';
import { and, db, eq, inArray, merchants, products, sql, storeProducts, stores } from '@pos-center/database';
import {
  BatchUpsertResult,
  IStoreProductRepository,
  UpsertStoreProductByUidInput
} from '../../domain/repositories/IStoreProductRepository';
import { StoreProduct } from '../../domain/entities/StoreProduct';

export class DrizzleStoreProductRepository implements IStoreProductRepository {
  async save(storeProduct: StoreProduct): Promise<void> {
    await this.upsertByUids({
      storeUid: storeProduct.storeId,
      productUid: storeProduct.productId,
      stock: storeProduct.stock,
      price: storeProduct.price,
    });
  }

  async findByStoreId(storeId: string): Promise<StoreProduct[]> {
    const rows = await db
      .select({
        uid: storeProducts.uid,
        storeUid: stores.uid,
        productUid: products.uid,
        stock: storeProducts.stock,
        price: storeProducts.price,
        unit: storeProducts.unit,
      })
      .from(storeProducts)
      .innerJoin(stores, eq(storeProducts.storeId, stores.id))
      .innerJoin(products, eq(storeProducts.productId, products.id))
      .where(eq(stores.uid, storeId));

    return rows.map(
      (row) =>
        new StoreProduct(
          row.uid,
          row.storeUid,
          row.productUid,
          row.stock,
          Number(row.price),
          row.unit || ''
        )
    );
  }

  async findByProductId(productId: string): Promise<StoreProduct[]> {
    const rows = await db
      .select({
        uid: storeProducts.uid,
        storeUid: stores.uid,
        productUid: products.uid,
        stock: storeProducts.stock,
        price: storeProducts.price,
        unit: storeProducts.unit,
      })
      .from(storeProducts)
      .innerJoin(stores, eq(storeProducts.storeId, stores.id))
      .innerJoin(products, eq(storeProducts.productId, products.id))
      .where(eq(products.uid, productId));

    return rows.map(
      (row) =>
        new StoreProduct(
          row.uid,
          row.storeUid,
          row.productUid,
          row.stock,
          Number(row.price),
          row.unit || ''
        )
    );
  }

  async delete(id: string): Promise<void> {
    await db.delete(storeProducts).where(eq(storeProducts.uid, id));
  }

  async upsertByUids(input: UpsertStoreProductByUidInput): Promise<'created' | 'updated'> {
    return db.transaction(async (tx) => {
      const store = await tx.query.stores.findFirst({
        where: eq(stores.uid, input.storeUid),
      });
      if (!store) {
        throw new Error(`store_uid "${input.storeUid}" not found`);
      }

      const product = await tx.query.products.findFirst({
        where: eq(products.uid, input.productUid),
      });
      if (!product) {
        throw new Error(`product_uid "${input.productUid}" not found`);
      }

      const existing = await tx.query.storeProducts.findFirst({
        where: and(
          eq(storeProducts.storeId, store.id),
          eq(storeProducts.productId, product.id)
        ),
      });

      if (existing) {
        await tx
          .update(storeProducts)
          .set({
            stock: input.stock,
            price: input.price.toString(),
            unit: product.unitName || existing.unit,
            rowVersion: sql`${storeProducts.rowVersion} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(storeProducts.id, existing.id));
        return 'updated';
      }

      await tx.insert(storeProducts).values({
        uid: randomUUID(),
        storeId: store.id,
        productId: product.id,
        stock: input.stock,
        price: input.price.toString(),
        unit: product.unitName || null,
        rowVersion: 1,
      });
      return 'created';
    });
  }

  async batchUpsertByUids(inputs: UpsertStoreProductByUidInput[], onlyMerchantUid?: string): Promise<BatchUpsertResult> {
    if (inputs.length === 0) return { created: 0, updated: 0, errors: [] };

    const storeUids = [...new Set(inputs.map((i) => i.storeUid))];
    const productUids = [...new Set(inputs.map((i) => i.productUid))];

    const [storeRows, productRows] = await Promise.all([
      db.select({ id: stores.id, uid: stores.uid, merchantUid: merchants.uid })
        .from(stores)
        .innerJoin(merchants, eq(stores.merchantId, merchants.id))
        .where(inArray(stores.uid, storeUids)),
      db.select({ id: products.id, uid: products.uid, unitName: products.unitName, merchantUid: merchants.uid })
        .from(products)
        .innerJoin(merchants, eq(products.merchantId, merchants.id))
        .where(inArray(products.uid, productUids)),
    ]);

    const storeMap = new Map(storeRows.map((s) => [s.uid, s]));
    const productMap = new Map(productRows.map((p) => [p.uid, p]));

    type ValidItem = { input: UpsertStoreProductByUidInput; storeId: number; productId: number; unitName: string | null };
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
      valid.push({ input, storeId: store.id, productId: product.id, unitName: product.unitName || null });
    }

    if (valid.length === 0) return { created: 0, updated: 0, errors };

    const storeIds = [...new Set(valid.map((v) => v.storeId))];
    const productIds = [...new Set(valid.map((v) => v.productId))];

    let created = 0;
    let updated = 0;

    await db.transaction(async (tx) => {
      const existingRows = await tx
        .select()
        .from(storeProducts)
        .where(
          and(
            inArray(storeProducts.storeId, storeIds),
            inArray(storeProducts.productId, productIds)
          )
        );

      const existingMap = new Map(existingRows.map((r) => [`${r.storeId}:${r.productId}`, r]));
      const pendingInserts = new Map<string, typeof storeProducts.$inferInsert>();

      for (const item of valid) {
        const key = `${item.storeId}:${item.productId}`;
        const existing = existingMap.get(key);
        const pending = pendingInserts.get(key);

        if (existing) {
          await tx
            .update(storeProducts)
            .set({
              stock: item.input.stock,
              price: item.input.price.toString(),
              unit: item.unitName ?? existing.unit,
              rowVersion: sql`${storeProducts.rowVersion} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(storeProducts.id, existing.id));
          updated++;
        } else if (pending) {
          // same (store, product) twice in one chunk: the later row wins, like a row of the next chunk would
          pending.stock = item.input.stock;
          pending.price = item.input.price.toString();
          updated++;
        } else {
          pendingInserts.set(key, {
            uid: randomUUID(),
            storeId: item.storeId,
            productId: item.productId,
            stock: item.input.stock,
            price: item.input.price.toString(),
            unit: item.unitName,
            rowVersion: 1,
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
