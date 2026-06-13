import { IProductRepository } from '../repositories/IProductRepository';
import { Product } from '../entities/Product';

export class GetProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(page?: number, limit?: number, filters?: any): Promise<{ products: Product[], total: number }> {
    return this.productRepository.findAll(page, limit, filters);
  }
}
