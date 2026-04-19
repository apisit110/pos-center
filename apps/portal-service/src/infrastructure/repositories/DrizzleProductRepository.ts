import { db, products, merchants, eq } from '@lightning/database';
import { ProductRepository } from '../../application/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';

export class DrizzleProductRepository implements ProductRepository {
  async getById(id: string): Promise<Product | null> {
    const result = await db.select({
      product: products,
      merchantUid: merchants.uid
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .where(eq(products.uid, id))
    .limit(1);

    if (result.length === 0) return null;

    const { product, merchantUid } = result[0];
    return new Product(
      product.uid,
      merchantUid,
      product.name,
      product.sku || '',
      product.barcode || '',
      Number(product.basePrice),
      (product.imageUrl as string[]) || [],
      product.brand || ''
    );
  }

  async getByMerchantId(merchantId: string): Promise<Product[]> {
    const result = await db.select({
      product: products,
      merchantUid: merchants.uid
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id))
    .where(eq(merchants.uid, merchantId));

    return result.map(({ product, merchantUid }) => new Product(
      product.uid,
      merchantUid,
      product.name,
      product.sku || '',
      product.barcode || '',
      Number(product.basePrice),
      (product.imageUrl as string[]) || [],
      product.brand || ''
    ));
  }

  async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<{ products: Product[], total: number }> {
    // Re-doing the query logic for dynamic filters
    const baseQuery = db.select({
      product: products,
      merchantUid: merchants.uid
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id));

    // In a real app, I'd use .where() with and() for filters.
    // For now, I'll return everything and we'll refine if needed.
    // Drizzle dynamic query building:
    
    const result = await baseQuery;
    const allProducts = result.map(({ product, merchantUid }) => new Product(
      product.uid,
      merchantUid,
      product.name,
      product.sku || '',
      product.barcode || '',
      Number(product.basePrice),
      (product.imageUrl as string[]) || [],
      product.brand || ''
    ));

    // Client-side filtering/pagination for now to keep it simple but functional
    let filtered = allProducts;
    if (filters) {
      if (filters.barcode) {
        filtered = filtered.filter(p => p.barcode.toLowerCase().includes(filters.barcode.toLowerCase()));
      }
      if (filters.name) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(filters.name.toLowerCase()));
      }
      if (filters.merchantId) {
        filtered = filtered.filter(p => p.merchantId === filters.merchantId);
      }
      if (filters.brands && filters.brands.length > 0) {
        filtered = filtered.filter(p => filters.brands.includes(p.brand));
      }
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      products: filtered.slice(start, end),
      total
    };
  }

  async getMetadata(): Promise<{ brands: string[], units: string[] }> {
    const result = await db.select({ brand: products.brand }).from(products);
    const brands = Array.from(new Set(result.map(r => r.brand).filter(b => !!b))) as string[];
    return { brands, units: [] };
  }

  async save(product: Product): Promise<void> {
    // Need to find merchant internal ID first
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.uid, product.merchantId)
    });

    if (!merchant) throw new Error('Merchant not found');

    await db.insert(products).values({
      uid: product.id,
      merchantId: merchant.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      basePrice: product.basePrice.toString(),
      imageUrl: product.imageUrl,
      brand: product.brand
    }).onConflictDoUpdate({
      target: products.uid,
      set: {
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        basePrice: product.basePrice.toString(),
        imageUrl: product.imageUrl,
        brand: product.brand
      }
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(products).where(eq(products.uid, id));
  }
}
