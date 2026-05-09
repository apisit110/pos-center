import { randomUUID } from 'crypto';
import { and, db, eq, products, storeProducts, stores } from '@lightning/database';
import {
  IStoreProductRepository,
  UpsertStoreProductByUidInput
} from '../../application/repositories/IStoreProductRepository';
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
      });
      return 'created';
    });
  }
}

