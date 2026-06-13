import { ProductRepository } from '../repositories/ProductRepository';

export class GetProductFilterMetadataUseCase {
  constructor(private productRepository: ProductRepository) {}

  public async execute(): Promise<{ brands: string[], units: string[] }> {
    return this.productRepository.getFilterMetadata();
  }
}
