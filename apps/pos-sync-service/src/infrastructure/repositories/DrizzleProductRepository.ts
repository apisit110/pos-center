import { db, products, storeProducts, merchants, stores, brands, runningNumbers, eq, and, or, gt, sql } from '@pos-center/database';
import { Product } from '../../domain/entities/Product';
import { IProductRepository, ProductFromClientDTO, ProductFromClientResultDTO } from '../../domain/repositories/IProductRepository';

/** Increases running number `product_version` by 1; creates the row with 1 when it does not exist. */
async function nextProductVersion(): Promise<number> {
  const [version] = await db.insert(runningNumbers)
    .values({ type: 'product_version', number: 1 })
    .onConflictDoUpdate({
      target: runningNumbers.type,
      set: { number: sql`${runningNumbers.number} + 1`, updatedAt: new Date() },
    })
    .returning({ newVersion: runningNumbers.number });
  return version.newVersion;
}

export class DrizzleProductRepository implements IProductRepository {
  async saveMany(_productsList: Product[]): Promise<void> {
    console.log('[DrizzleProductRepository] saveMany not implemented - service acts as distributor');
  }

  async receiveProductsFromClient(mid: string, sid: string, productsList: ProductFromClientDTO[]): Promise<ProductFromClientResultDTO[]> {
    const results: ProductFromClientResultDTO[] = [];

    const merchant = await db.select().from(merchants).where(eq(merchants.partnerId, mid)).limit(1);
    if (!merchant.length) {
      return productsList.map(p => ({ id: p.id, status: 'error', error: `Merchant ${mid} not found` }));
    }

    const merchantId = merchant[0].id;

    const store = await db.select().from(stores)
      .where(and(eq(stores.sid, sid), eq(stores.merchantId, merchantId)))
      .limit(1);
    if (!store.length) {
      return productsList.map(p => ({ id: p.id, status: 'error', error: `Store ${sid} not found` }));
    }

    const storeId = store[0].id;

    // one new product_version for the whole request, so other pos of the store can pull the changes
    const syncVersion = await nextProductVersion();

    for (const p of productsList) {
      try {
        const brandId = await this.findBrandId(p.brand);
        const existing = await db.select().from(products).where(eq(products.uid, p.id)).limit(1);

        let productId: number;

        if (existing.length) {
          await db.update(products).set({
            nameEn: p.name,
            nameTh: p.name,
            sku: p.barcode, // sku = barcode
            barcode: p.barcode,
            basePrice: String(p.basePrice),
            imageUrl: p.imageUrl ?? null,
            unitName: p.unitName ?? null,
            brandId,
            updatedAt: new Date(),
          }).where(eq(products.uid, p.id));
          productId = existing[0].id;
        } else {
          const inserted = await db.insert(products).values({
            uid: p.id,
            merchantId,
            nameEn: p.name,
            nameTh: p.name,
            sku: p.barcode, // sku = barcode
            barcode: p.barcode,
            basePrice: String(p.basePrice),
            imageUrl: p.imageUrl ?? null,
            unitName: p.unitName ?? null,
            brandId,
          }).returning({ id: products.id });
          productId = inserted[0].id;
        }

        const existingStoreProduct = await db.select().from(storeProducts)
          .where(and(eq(storeProducts.productId, productId), eq(storeProducts.storeId, storeId)))
          .limit(1);

        if (existingStoreProduct.length) {
          await db.update(storeProducts).set({
            price: String(p.basePrice),
            syncVersion,
            updatedAt: new Date(),
          }).where(and(eq(storeProducts.productId, productId), eq(storeProducts.storeId, storeId)));
          results.push({ id: p.id, status: 'already_synced' });
        } else {
          await db.insert(storeProducts).values({
            storeId,
            productId,
            price: String(p.basePrice),
            stock: 0,
            syncVersion,
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
      partnerId: merchants.partnerId,
      storeSid: stores.sid,
      brandNameEn: brands.nameEn,
    })
    .from(products)
    .innerJoin(storeProducts, eq(products.id, storeProducts.productId))
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .innerJoin(stores, eq(storeProducts.storeId, stores.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(
      and(
        eq(merchants.partnerId, mid),
        eq(stores.sid, sid),
        gt(storeProducts.syncVersion, version)
      )
    );

    return result.map(({ product, storeProduct, partnerId, storeSid, brandNameEn }) => new Product(
      product.uid,
      partnerId,
      storeSid,
      product.nameTh,
      product.nameEn,
      product.nameTh,
      product.sku || '',
      product.barcode || '',
      Number(product.basePrice),
      product.imageUrl || '',
      brandNameEn || '',
      storeProduct.syncVersion
    ));
  }

  /** brand id by brand name (EN or TH), null when the brand is not set or not found */
  private async findBrandId(brand?: string | null): Promise<number | null> {
    if (!brand) return null;
    const [row] = await db.select({ id: brands.id }).from(brands)
      .where(or(eq(brands.nameEn, brand), eq(brands.nameTh, brand)))
      .limit(1);
    return row?.id ?? null;
  }
}
