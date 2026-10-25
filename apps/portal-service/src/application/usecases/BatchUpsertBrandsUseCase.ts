import { Brand } from '../../domain/entities/Product';
import { IBrandRepository } from '../../domain/repositories/IBrandRepository';
import { ValidationError } from '../errors/ValidationError';

/** Creates brands, or updates the names of existing brands by uid. Brands are shared by all merchants. */
export class BatchUpsertBrandsUseCase {
  constructor(private readonly brandRepository: IBrandRepository) {}

  async execute(brandList: Brand[]): Promise<{ created: number; updated: number }> {
    const seen = new Set<string>();
    brandList.forEach((brand, index) => {
      if (seen.has(brand.uid)) throw ValidationError.ErrInvalidRequest(`brands.${index}.uid: duplicate uid ${brand.uid}`);
      seen.add(brand.uid);
    });

    return this.brandRepository.upsertMany(brandList);
  }
}
