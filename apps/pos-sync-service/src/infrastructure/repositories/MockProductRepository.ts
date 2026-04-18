import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../application/repositories/IProductRepository';

export class MockProductRepository implements IProductRepository {
  private products: Product[] = [];

  async saveMany(products: Product[]): Promise<void> {
    console.log(`[MockProductRepository] Saving ${products.length} products`);
    this.products.push(...products);
    
    // In a real scenario, we would upsert or save to DB
    products.forEach(p => {
        console.log(` - Saved: ${p.name} (SKU: ${p.sku})`);
    });
  }
}
