import { ProductRepository } from '../repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';

export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}
