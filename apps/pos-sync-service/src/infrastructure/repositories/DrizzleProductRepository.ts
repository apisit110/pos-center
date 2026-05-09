import { db, products, storeProducts, merchants, stores, eq, and, gt } from '@lightning/database';
import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../application/repositories/IProductRepository';

export class DrizzleProductRepository implements IProductRepository {
  async saveMany(productsList: Product[]): Promise<void> {
    // Implementation for saveMany if needed, but for now we focus on findByVersion
    // Usually pos-sync-service might not need to saveMany if it's just distributing
    console.log('[DrizzleProductRepository] saveMany not implemented - service acts as distributor');
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
