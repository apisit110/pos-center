import { Product } from '../../domain/entities/Product';

export interface ProductRepository {
  getProducts(page: number, limit: number): Promise<{ products: Product[], total: number }>;
}
