import { Brand } from '../entities/Product';
import { BrandRepository } from '../repositories/BrandRepository';

export class BatchUpsertBrandsUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  public async execute(brands: Brand[]): Promise<{ created: number; updated: number }> {
    return this.brandRepository.upsertBrands(brands);
  }
}
