import { randomUUID } from 'crypto';
import { db, products, storeProducts, merchants, stores, eq, and, gt } from '@pos-center/database';
import { Product } from '../../domain/entities/Product';
import { IProductRepository, ProductFromClientDTO, ProductFromClientResultDTO } from '../../domain/repositories/IProductRepository';

export class DrizzleProductRepository implements IProductRepository {
  async saveMany(_productsList: Product[]): Promise<void> {
    console.log('[DrizzleProductRepository] saveMany not implemented - service acts as distributor');
  }

  async receiveProductsFromClient(mid: string, sid: string, productsList: ProductFromClientDTO[]): Promise<ProductFromClientResultDTO[]> {
    const results: ProductFromClientResultDTO[] = [];

    const merchant = await db.select().from(merchants).where(eq(merchants.mid, mid)).limit(1);
    if (!merchant.length) {
      return productsList.map(p => ({ id: p.id, status: 'error', error: `Merchant ${mid} not found` }));
    }

    const store = await db.select().from(stores).where(eq(stores.sid, sid)).limit(1);
    if (!store.length) {
      return productsList.map(p => ({ id: p.id, status: 'error', error: `Store ${sid} not found` }));
    }

    const merchantId = merchant[0].id;
    const storeId = store[0].id;

    for (const p of productsList) {
      try {
        const existing = await db.select().from(products).where(eq(products.uid, p.id)).limit(1);

        let productId: number;

        if (existing.length) {
          await db.update(products).set({
            name: p.name,
            barcode: p.barcode,
            basePrice: String(p.basePrice),
            imageUrl: p.imageUrl ?? null,
            unitName: p.unitName ?? null,
            brand: p.brand ?? null,
            updatedAt: new Date(),
          }).where(eq(products.uid, p.id));
          productId = existing[0].id;
        } else {
          const inserted = await db.insert(products).values({
            uid: p.id,
            merchantId,
            name: p.name,
            barcode: p.barcode,
            basePrice: String(p.basePrice),
            imageUrl: p.imageUrl ?? null,
            unitName: p.unitName ?? null,
            brand: p.brand ?? null,
          }).returning({ id: products.id });
          productId = inserted[0].id;
        }

        const existingStoreProduct = await db.select().from(storeProducts)
          .where(and(eq(storeProducts.productId, productId), eq(storeProducts.storeId, storeId)))
          .limit(1);

        if (existingStoreProduct.length) {
          await db.update(storeProducts).set({
            price: String(p.basePrice),
            updatedAt: new Date(),
          }).where(eq(storeProducts.id, existingStoreProduct[0].id));
          results.push({ id: p.id, status: 'already_synced' });
        } else {
          await db.insert(storeProducts).values({
            uid: randomUUID(),
            storeId,
            productId,
            price: String(p.basePrice),
            stock: 0,
          });
          results.push({ id: p.id, status: 'synced' });
        }
      } catch (error: any) {
        console.error(`[DrizzleProductRepository] Error uploading product ${p.id}:`, error.message);
        results.push({ id: p.id, status: 'error', error: error.message });
      }
    }

    return results;
  }

  async findByVersion(mid: string, sid: string, version: number): Promise<Product[]> {
    const result = await db.select({
      product: products,
      storeProduct: storeProducts,
      merchantUid: merchants.mid,
      storeUid: stores.sid
    })
    .from(products)
    .innerJoin(storeProducts, eq(products.id, storeProducts.productId))
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .innerJoin(stores, eq(storeProducts.storeId, stores.id))
    .where(
      and(
        eq(merchants.mid, mid),
        eq(stores.sid, sid),
        gt(storeProducts.rowVersion, version)
      )
    );

    return result.map(({ product, storeProduct, merchantUid, storeUid }) => new Product(
      product.uid,
      merchantUid,
      storeUid,
      product.name,
      product.sku || '',
      product.barcode || '',
      Number(product.basePrice),
      Array.isArray(product.imageUrl) ? product.imageUrl[0] || '' : (product.imageUrl as string) || '',
      product.brand || '',
      storeProduct.rowVersion
    ));
  }
}
