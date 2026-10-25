import { merchantUidIs } from '../utils/merchant';
import {
  db, products, merchants, brands, storeProducts, stores, eq, ilike, or, and, inArray, lte, sql, runningNumbers, desc, asc,
  isNotNull, ne, SQL,
} from '@pos-center/database';
import { IProductRepository, ProductFilter, BarcodeOwner, ProductOwner } from '../../domain/repositories/IProductRepository';
import { Brand, Product } from '../../domain/entities/Product';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const selectProducts = () => db.select({
  product: products,
  merchantUid: merchants.uid,
  partnerId: merchants.partnerId,
  brandUid: brands.uid,
  brandNameEn: brands.nameEn,
  brandNameTh: brands.nameTh,
})
  .from(products)
  .innerJoin(merchants, eq(products.merchantId, merchants.id))
  .leftJoin(brands, eq(products.brandId, brands.id));

type ProductRow = Awaited<ReturnType<typeof selectProducts>>[number];

function toEntity(row: ProductRow): Product {
  const { product } = row;
  return new Product(
    product.uid,
    row.merchantUid,
    row.partnerId,
    product.nameEn,
    product.nameTh,
    product.sku || '',
    product.barcode || '',
    Number(product.basePrice),
    product.imageUrl || '',
    row.brandUid ? { uid: row.brandUid, nameEn: row.brandNameEn ?? '', nameTh: row.brandNameTh ?? '' } : null,
    product.unitName || ''
  );
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

/** Sets `sync_version` of every store product of the products to a new `product_version`, so pos can sync the changes. */
async function bumpSyncVersion(tx: Tx, productIds: number[]): Promise<void> {
  if (productIds.length === 0) return;
  const [version] = await nextProductVersion(tx);
  if (version === undefined) return;
  await tx.update(storeProducts)
    .set({ syncVersion: version.newVersion, updatedAt: new Date() })
    .where(inArray(storeProducts.productId, productIds));
}

/** brand id by brand uid, for the brands of the products */
async function findBrandIds(productList: Product[]): Promise<Map<string, number>> {
  const brandUids = [...new Set(productList.flatMap((p) => (p.brand ? [p.brand.uid] : [])))];
  if (brandUids.length === 0) return new Map();
  const rows = await db.select({ id: brands.id, uid: brands.uid }).from(brands).where(inArray(brands.uid, brandUids));
  return new Map(rows.map((r) => [r.uid, r.id]));
}

export class DrizzleProductRepository implements IProductRepository {
  async getById(id: string): Promise<Product | null> {
    const result = await selectProducts().where(eq(products.uid, id)).limit(1);
    return result[0] ? toEntity(result[0]) : null;
  }

  async findAll(page: number, limit: number, filters?: ProductFilter): Promise<{ products: Product[], total: number }> {
    const whereConditions: SQL[] = [];

    if (filters?.barcode) {
      whereConditions.push(ilike(products.barcode, `%${filters.barcode}%`));
    }
    if (filters?.name) {
      whereConditions.push(or(ilike(products.nameEn, `%${filters.name}%`), ilike(products.nameTh, `%${filters.name}%`))!);
    }
    if (filters?.merchantUid) {
      whereConditions.push(merchantUidIs(filters.merchantUid));
    }
    if (filters?.brands && filters.brands.length > 0) {
      whereConditions.push(inArray(brands.uid, filters.brands));
    }
    if (filters?.units && filters.units.length > 0) {
      whereConditions.push(inArray(products.unitName, filters.units));
    }
    if (filters?.price !== undefined) {
      whereConditions.push(lte(products.basePrice, filters.price.toString()));
    }
    if (filters?.storeUid) {
      // products listed in the store (map_store_product joined with store), without duplicating product rows
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
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    const result = await selectProducts()
      .where(whereClause)
      .orderBy(desc(products.id))
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      products: result.map(toEntity),
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

  async findBrandsByUids(brandUids: string[]): Promise<Brand[]> {
    if (brandUids.length === 0) return [];

    return db.select({ uid: brands.uid, nameEn: brands.nameEn, nameTh: brands.nameTh })
      .from(brands)
      .where(inArray(brands.uid, brandUids));
  }

  async getMetadata(merchantUid?: string): Promise<{ brands: Brand[], units: string[] }> {
    const merchantFilter = merchantUid ? merchantUidIs(merchantUid) : undefined;

    const brandRows = await db.selectDistinct({ uid: brands.uid, nameEn: brands.nameEn, nameTh: brands.nameTh })
      .from(products)
      .innerJoin(merchants, eq(products.merchantId, merchants.id))
      .innerJoin(brands, eq(products.brandId, brands.id))
      .where(merchantFilter)
      .orderBy(asc(brands.nameEn));

    const unitRows = await db.selectDistinct({ unit: products.unitName })
      .from(products)
      .innerJoin(merchants, eq(products.merchantId, merchants.id))
      .where(and(isNotNull(products.unitName), ne(products.unitName, ''), merchantFilter))
      .orderBy(asc(products.unitName));

    return {
      brands: brandRows,
      units: unitRows.map((r) => r.unit as string),
    };
  }

  async save(product: Product): Promise<void> {
    const brandIds = await findBrandIds([product]);

    await db.transaction(async (tx) => {
      const merchant = await tx.query.merchants.findFirst({
        where: eq(merchants.uid, product.merchantId)
      });

      if (!merchant) throw new Error('Merchant not found');

      const values = {
        nameEn: product.nameEn,
        nameTh: product.nameTh,
        sku: product.sku,
        barcode: product.barcode,
        basePrice: product.basePrice.toString(),
        imageUrl: product.imageUrl || null,
        brandId: product.brand ? brandIds.get(product.brand.uid) ?? null : null,
        unitName: product.unitName || null,
      };

      const inserted = await tx.insert(products)
        .values({ uid: product.id, merchantId: merchant.id, ...values })
        .onConflictDoUpdate({ target: products.uid, set: { ...values, updatedAt: new Date() } })
        .returning({ id: products.id });

      await bumpSyncVersion(tx, inserted.map((r) => r.id));
    });
  }

  async bulkSave(productList: Product[]): Promise<void> {
    if (productList.length === 0) return;

    // Resolve unique merchants and brands once (avoids N lookups inside the loop)
    const uniqueMerchantUids = [...new Set(productList.map(p => p.merchantId))];
    const merchantRows = await db.select({ uid: merchants.uid, id: merchants.id })
      .from(merchants)
      .where(inArray(merchants.uid, uniqueMerchantUids));

    const merchantIdMap = new Map(merchantRows.map(m => [m.uid, m.id]));
    const missing = uniqueMerchantUids.filter(uid => !merchantIdMap.has(uid));
    if (missing.length > 0) throw new Error(`Merchants not found: ${missing.join(', ')}`);

    const brandIds = await findBrandIds(productList);

    const CHUNK_SIZE = 500;
    for (let i = 0; i < productList.length; i += CHUNK_SIZE) {
      const chunk = productList.slice(i, i + CHUNK_SIZE);
      await db.transaction(async (tx) => {
        const inserted = await tx.insert(products).values(
          chunk.map(p => ({
            uid: p.id,
            merchantId: merchantIdMap.get(p.merchantId)!,
            nameEn: p.nameEn,
            nameTh: p.nameTh,
            sku: p.sku,
            barcode: p.barcode,
            basePrice: p.basePrice.toString(),
            imageUrl: p.imageUrl || null,
            brandId: p.brand ? brandIds.get(p.brand.uid) ?? null : null,
            unitName: p.unitName || null,
          }))
        ).onConflictDoUpdate({
          target: products.uid,
          set: {
            nameEn: sql`excluded.name_en`,
            nameTh: sql`excluded.name_th`,
            sku: sql`excluded.sku`,
            barcode: sql`excluded.barcode`,
            basePrice: sql`excluded.base_price`,
            imageUrl: sql`excluded.image_url`,
            brandId: sql`excluded.brand_id`,
            unitName: sql`excluded.unit_name`,
            updatedAt: new Date()
          }
        }).returning({ id: products.id });

        await bumpSyncVersion(tx, inserted.map(r => r.id));
      });
    }
  }
}
