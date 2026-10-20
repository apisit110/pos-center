import { merchantUidIs } from '../utils/merchant';
import { db, products, merchants, storeProducts, stores, eq, ilike, and, inArray, lte, sql, runningNumbers, desc, asc, isNotNull, ne, SQL } from '@pos-center/database';
import { IProductRepository, ProductFilter, BarcodeOwner, ProductOwner } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';

type ProductRow = typeof products.$inferSelect;

function toImageUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string' && value) return [value];
  return [];
}

/** Increases running number `product_version` by 1; creates the row with 1 when it does not exist. */
async function nextProductVersion(tx: Pick<typeof db, 'insert'>) {
  return tx.insert(runningNumbers)
    .values({ type: 'product_version', number: 1 })
    .onConflictDoUpdate({
      target: runningNumbers.type,
      set: { number: sql`${runningNumbers.number} + 1`, updatedAt: new Date() },
    })
    .returning({ newVersion: runningNumbers.number });
}

export class DrizzleProductRepository implements IProductRepository {
  private toEntity(product: ProductRow, merchantUid: string, mid: string): Product {
    return new Product(
      product.uid,
      merchantUid,
      mid,
      product.name,
      product.sku || '',
      product.barcode || '',
      Number(product.basePrice),
      toImageUrls(product.imageUrl),
      product.brand || '',
      product.unitName || ''
    );
  }

  async getById(id: string): Promise<Product | null> {
    const result = await db.select({
      product: products,
      merchantUid: merchants.uid,
      mid: merchants.mid
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .where(eq(products.uid, id))
    .limit(1);

    if (result.length === 0) return null;

    const { product, merchantUid, mid } = result[0];
    return this.toEntity(product, merchantUid, mid);
  }

  async getByMerchantId(merchantId: string): Promise<Product[]> {
    const result = await db.select({
      product: products,
      merchantUid: merchants.uid,
      mid: merchants.mid
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .where(eq(merchants.uid, merchantId));

    return result.map(({ product, merchantUid, mid }) => this.toEntity(product, merchantUid, mid));
  }

  async findAll(page: number, limit: number, filters?: ProductFilter): Promise<{ products: Product[], total: number }> {
    const whereConditions: SQL[] = [];

    if (filters?.barcode) {
      whereConditions.push(ilike(products.barcode, `%${filters.barcode}%`));
    }
    if (filters?.name) {
      whereConditions.push(ilike(products.name, `%${filters.name}%`));
    }
    if (filters?.merchantUid) {
      whereConditions.push(merchantUidIs(filters.merchantUid));
    }
    if (filters?.brands && filters.brands.length > 0) {
      whereConditions.push(inArray(products.brand, filters.brands));
    }
    if (filters?.units && filters.units.length > 0) {
      whereConditions.push(inArray(products.unitName, filters.units));
    }
    if (filters?.price !== undefined) {
      whereConditions.push(lte(products.basePrice, filters.price.toString()));
    }
    if (filters?.storeUid) {
      // products listed in the store (store_products joined with stores), without duplicating product rows
      whereConditions.push(
        inArray(
          products.id,
          db.select({ productId: storeProducts.productId })
            .from(storeProducts)
            .innerJoin(stores, eq(storeProducts.storeId, stores.id))
            .where(eq(stores.uid, filters.storeUid)),
        ),
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const countResult = await db.select({
      count: sql<number>`count(distinct ${products.id})`
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    const result = await db.select({
      product: products,
      merchantUid: merchants.uid,
      mid: merchants.mid
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .where(whereClause)
    .orderBy(desc(products.id))
    .limit(limit)
    .offset((page - 1) * limit);

    return {
      products: result.map(({ product, merchantUid, mid }) => this.toEntity(product, merchantUid, mid)),
      total
    };
  }

  async findBarcodeOwners(merchantUid: string, barcodes: string[]): Promise<BarcodeOwner[]> {
    if (barcodes.length === 0) return [];

    const rows = await db.select({ barcode: products.barcode, productUid: products.uid })
      .from(products)
      .innerJoin(merchants, eq(products.merchantId, merchants.id))
      .where(and(merchantUidIs(merchantUid), inArray(products.barcode, barcodes)));

    return rows.map((row) => ({ barcode: row.barcode ?? '', productUid: row.productUid }));
  }

  async findOwnersByUids(productUids: string[]): Promise<ProductOwner[]> {
    if (productUids.length === 0) return [];

    return db.select({ productUid: products.uid, merchantUid: merchants.uid })
      .from(products)
      .innerJoin(merchants, eq(products.merchantId, merchants.id))
      .where(inArray(products.uid, productUids));
  }

  async getMetadata(merchantUid?: string): Promise<{ brands: string[], units: string[] }> {
    const merchantFilter = merchantUid ? eq(merchants.uid, merchantUid) : undefined;

    const brandRows = await db.selectDistinct({ brand: products.brand })
      .from(products)
      .innerJoin(merchants, eq(products.merchantId, merchants.id))
      .where(and(isNotNull(products.brand), ne(products.brand, ''), merchantFilter))
      .orderBy(asc(products.brand));

    const unitRows = await db.selectDistinct({ unit: products.unitName })
      .from(products)
      .innerJoin(merchants, eq(products.merchantId, merchants.id))
      .where(and(isNotNull(products.unitName), ne(products.unitName, ''), merchantFilter))
      .orderBy(asc(products.unitName));

    return {
      brands: brandRows.map((r) => r.brand as string),
      units: unitRows.map((r) => r.unit as string),
    };
  }

  async save(product: Product): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Find merchant internal ID
      const merchant = await tx.query.merchants.findFirst({
        where: eq(merchants.uid, product.merchantId)
      });

      if (!merchant) throw new Error('Merchant not found');

      // 2. Insert/Update product
      const inserted = await tx.insert(products).values({
        uid: product.id,
        merchantId: merchant.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        basePrice: product.basePrice.toString(),
        imageUrl: product.imageUrl,
        brand: product.brand,
        unitName: product.unitName
      }).onConflictDoUpdate({
        target: products.uid,
        set: {
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          basePrice: product.basePrice.toString(),
          imageUrl: product.imageUrl,
          brand: product.brand,
          unitName: product.unitName,
          updatedAt: new Date()
        }
      }).returning({ id: products.id });

      const productId = inserted[0]?.id;
      if (!productId) return;

      // 3. Increment product_version and get new version
      const versionResult = await nextProductVersion(tx);

      const newVersion = versionResult[0]?.newVersion;

      if (newVersion !== undefined) {
        // 4. Update row_version for all store_products associated with this product
        await tx.update(storeProducts)
          .set({ 
            rowVersion: newVersion,
            updatedAt: new Date()
          })
          .where(eq(storeProducts.productId, productId));
      }
    });
  }

  async bulkSave(productList: Product[]): Promise<void> {
    if (productList.length === 0) return;

    // Resolve unique merchants once (avoids N lookups inside the loop)
    const uniqueMerchantUids = [...new Set(productList.map(p => p.merchantId))];
    const merchantRows = await db.select({ uid: merchants.uid, id: merchants.id })
      .from(merchants)
      .where(inArray(merchants.uid, uniqueMerchantUids));

    const merchantIdMap = new Map(merchantRows.map(m => [m.uid, m.id]));
    const missing = uniqueMerchantUids.filter(uid => !merchantIdMap.has(uid));
    if (missing.length > 0) throw new Error(`Merchants not found: ${missing.join(', ')}`);

    const CHUNK_SIZE = 500;
    for (let i = 0; i < productList.length; i += CHUNK_SIZE) {
      const chunk = productList.slice(i, i + CHUNK_SIZE);
      await db.transaction(async (tx) => {
        const inserted = await tx.insert(products).values(
          chunk.map(p => ({
            uid: p.id,
            merchantId: merchantIdMap.get(p.merchantId)!,
            name: p.name,
            sku: p.sku,
            barcode: p.barcode,
            basePrice: p.basePrice.toString(),
            imageUrl: p.imageUrl,
            brand: p.brand,
            unitName: p.unitName
          }))
        ).onConflictDoUpdate({
          target: products.uid,
          set: {
            name: sql`excluded.name`,
            sku: sql`excluded.sku`,
            barcode: sql`excluded.barcode`,
            basePrice: sql`excluded.base_price`,
            imageUrl: sql`excluded.image_url`,
            brand: sql`excluded.brand`,
            unitName: sql`excluded.unit_name`,
            updatedAt: new Date()
          }
        }).returning({ id: products.id });

        if (inserted.length === 0) return;

        const versionResult = await nextProductVersion(tx);

        const newVersion = versionResult[0]?.newVersion;
        if (newVersion !== undefined) {
          const productIds = inserted.map(r => r.id);
          await tx.update(storeProducts)
            .set({ rowVersion: newVersion, updatedAt: new Date() })
            .where(inArray(storeProducts.productId, productIds));
        }
      });
    }
  }

  async delete(id: string): Promise<void> {
    await db.delete(products).where(eq(products.uid, id));
  }
}
