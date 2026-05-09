import { db, products, merchants, storeProducts, stores, eq, ilike, and, inArray, lte, sql, runningNumbers } from '@lightning/database';
import { IProductRepository } from '../../application/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';

export class DrizzleProductRepository implements IProductRepository {
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
    return new Product(
      product.uid,
      merchantUid,
      mid,
      product.name,
      product.sku || '',
      product.barcode || '',
      Number(product.basePrice),
      (product.imageUrl as string[]) || [],
      product.brand || '',
      product.unitName || ''
    );
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

    return result.map(({ product, merchantUid, mid }) => new Product(
      product.uid,
      merchantUid,
      mid,
      product.name,
      product.sku || '',
      product.barcode || '',
      Number(product.basePrice),
      (product.imageUrl as string[]) || [],
      product.brand || '',
      product.unitName || ''
    ));
  }

  async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<{ products: Product[], total: number }> {
    const whereConditions = [];

    if (filters?.barcode) {
      whereConditions.push(ilike(products.barcode, `%${filters.barcode}%`));
    }
    if (filters?.name) {
      whereConditions.push(ilike(products.name, `%${filters.name}%`));
    }
    if (filters?.merchantId) {
      whereConditions.push(eq(merchants.uid, filters.merchantId));
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

    let query = db.select({
      product: products,
      merchantUid: merchants.uid,
      mid: merchants.mid
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id));

    if (filters?.storeId) {
      query = query.innerJoin(storeProducts, eq(products.id, storeProducts.productId))
                   .innerJoin(stores, eq(storeProducts.storeId, stores.id)) as any;
      whereConditions.push(eq(stores.uid, filters.storeId));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const countResult = await db.select({ 
      count: sql<number>`count(distinct ${products.id})` 
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .leftJoin(storeProducts, eq(products.id, storeProducts.productId))
    .leftJoin(stores, eq(storeProducts.storeId, stores.id))
    .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Get paginated results
    const result = await query
      .where(whereClause)
      .limit(limit)
      .offset((page - 1) * limit);

    const mappedProducts = result.map(({ product, merchantUid, mid }: any) => new Product(
      product.uid,
      merchantUid,
      mid,
      product.name,
      product.sku || '',
      product.barcode || '',
      Number(product.basePrice),
      (product.imageUrl as string[]) || [],
      product.brand || '',
      product.unitName || ''
    ));

    return {
      products: mappedProducts,
      total
    };
  }

  async getMetadata(): Promise<{ brands: string[], units: string[] }> {
    const brandResult = await db.select({ brand: products.brand }).from(products);
    const unitResult = await db.select({ unit: products.unitName }).from(products);
    
    const brands = Array.from(new Set(brandResult.map(r => r.brand).filter(b => !!b))) as string[];
    const units = Array.from(new Set(unitResult.map(r => r.unit).filter(u => !!u))) as string[];
    
    return { brands, units };
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
      const versionResult = await tx.update(runningNumbers)
        .set({ 
          number: sql`${runningNumbers.number} + 1`,
          updatedAt: new Date()
        })
        .where(eq(runningNumbers.type, 'product_version'))
        .returning({ newVersion: runningNumbers.number });

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

  async delete(id: string): Promise<void> {
    await db.delete(products).where(eq(products.uid, id));
  }
}
