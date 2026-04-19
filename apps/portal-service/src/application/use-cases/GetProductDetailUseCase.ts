import { ProductRepository } from '../repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';

export class GetProductDetailUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: string): Promise<Product | null> {
    return this.productRepository.getById(id);
  }
}
