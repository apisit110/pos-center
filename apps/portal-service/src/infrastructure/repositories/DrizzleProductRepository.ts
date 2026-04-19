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

  async findAll(): Promise<Product[]> {
    const result = await db.select({
      product: products,
      merchantUid: merchants.uid
    })
    .from(products)
    .innerJoin(merchants, eq(products.merchantId, merchants.id));

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
