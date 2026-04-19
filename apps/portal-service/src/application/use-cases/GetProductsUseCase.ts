import { ProductRepository } from '../repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';

export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(page?: number, limit?: number, filters?: any): Promise<{ products: Product[], total: number }> {
    return this.productRepository.findAll(page, limit, filters);
  }
}
