import { IStoreProductRepository } from '../repositories/IStoreProductRepository';

export interface BatchStoreProductMappingRequest {
  store_uid?: string;
  product_uid?: string;
  stock?: number;
  price?: number;
}

export interface BatchStoreProductMappingResult {
  created: number;
  updated: number;
  errors: string[];
}

export class BatchUpsertStoreProductsUseCase {
  constructor(private readonly storeProductRepository: IStoreProductRepository) {}

  async execute(mappings: BatchStoreProductMappingRequest[]): Promise<BatchStoreProductMappingResult> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const [index, mapping] of mappings.entries()) {
      try {
        const storeUid = mapping.store_uid;
        const productUid = mapping.product_uid;
        const stock = Number(mapping.stock);
        const price = Number(mapping.price);

        if (!storeUid || !productUid) {
          throw new Error('store_uid and product_uid are required');
        }

        if (!Number.isFinite(stock) || stock < 0) {
          throw new Error('stock must be a non-negative number');
        }

        if (!Number.isFinite(price) || price < 0) {
          throw new Error('price must be a non-negative number');
        }

        const action = await this.storeProductRepository.upsertByUids({
          storeUid,
          productUid,
          stock,
          price,
        });

        if (action === 'created') {
          created++;
        } else {
          updated++;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Row ${index + 1}: ${message}`);
      }
    }

    return { created, updated, errors };
  }
}

