import { IProductRepository } from '../repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';

export class GetProductDetailUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(id: string): Promise<Product | null> {
    return this.productRepository.getById(id);
  }
}
