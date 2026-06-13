import { IProductRepository } from '../repositories/IProductRepository';

export class GetProductFilterMetadataUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(): Promise<{ brands: string[], units: string[] }> {
    return this.productRepository.getMetadata();
  }
}
