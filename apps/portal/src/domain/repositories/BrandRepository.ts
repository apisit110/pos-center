import { Brand } from '../entities/Product';

export interface BrandRepository {
  /** Creates brands, or updates the names of existing brands by uid. */
  upsertBrands(brands: Brand[]): Promise<{ created: number; updated: number }>;
}
