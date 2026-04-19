import { ProductRepository } from '../repositories/ProductRepository';

export class GetProductFilterMetadataUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(): Promise<{ brands: string[], units: string[] }> {
    return this.productRepository.getMetadata();
  }
}
