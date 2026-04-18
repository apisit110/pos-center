import { ProductRepository } from '../repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';

export class GetProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  public async execute(id: string): Promise<Product | null> {
    return this.productRepository.getProductById(id);
  }
}
