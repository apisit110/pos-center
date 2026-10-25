import { Brand } from '../../domain/entities/Product';

export interface IBrandRepository {
  /** Inserts the brands, or updates the names of the ones whose uid already exists, in one transaction. */
  upsertMany(brands: Brand[]): Promise<{ created: number; updated: number }>;
}
