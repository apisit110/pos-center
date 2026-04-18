import { ProductRepository, ProductFilter } from '../repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';

export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  public async execute(page: number, limit: number, filters?: ProductFilter): Promise<{ products: Product[], total: number }> {
    return this.productRepository.getProducts(page, limit, filters);
  }
}
