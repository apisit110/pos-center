import { Brand } from '../entities/Product';
import { ProductRepository } from '../repositories/ProductRepository';

export class GetProductFilterMetadataUseCase {
  constructor(private productRepository: ProductRepository) {}

  public async execute(): Promise<{ brands: Brand[], units: string[] }> {
    return this.productRepository.getFilterMetadata();
  }
}
