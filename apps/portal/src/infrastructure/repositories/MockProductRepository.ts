import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../application/repositories/ProductRepository';

export class MockProductRepository implements ProductRepository {
  private products: Product[] = Array.from({ length: 50 }, (_, i) => new Product(
    `${i + 1}`,
    `Product ${i + 1}`,
    Math.floor(Math.random() * 1000) + 10,
    ['Electronics', 'Apparel', 'Food', 'Home'][Math.floor(Math.random() * 4)],
    Math.floor(Math.random() * 100)
  ));

  public async getProducts(page: number, limit: number): Promise<{ products: Product[], total: number }> {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      products: this.products.slice(start, end),
      total: this.products.length
    };
  }
}
