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

const CHUNK_SIZE = 500;

export class BatchUpsertStoreProductsUseCase {
  constructor(private readonly storeProductRepository: IStoreProductRepository) {}

  async execute(mappings: BatchStoreProductMappingRequest[]): Promise<BatchStoreProductMappingResult> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    type ValidItem = { storeUid: string; productUid: string; stock: number; price: number; originalIndex: number };
    const validItems: ValidItem[] = [];

    for (const [index, mapping] of mappings.entries()) {
      const storeUid = mapping.store_uid;
      const productUid = mapping.product_uid;
      const stock = Number(mapping.stock);
      const price = Number(mapping.price);

      if (!storeUid || !productUid) {
        errors.push(`Row ${index + 1}: store_uid and product_uid are required`);
        continue;
      }
      if (!Number.isFinite(stock) || stock < 0) {
        errors.push(`Row ${index + 1}: stock must be a non-negative number`);
        continue;
      }
      if (!Number.isFinite(price) || price < 0) {
        errors.push(`Row ${index + 1}: price must be a non-negative number`);
        continue;
      }

      validItems.push({ storeUid, productUid, stock, price, originalIndex: index });
    }

    for (let i = 0; i < validItems.length; i += CHUNK_SIZE) {
      const chunk = validItems.slice(i, i + CHUNK_SIZE);
      const result = await this.storeProductRepository.batchUpsertByUids(
        chunk.map(({ storeUid, productUid, stock, price }) => ({ storeUid, productUid, stock, price }))
      );

      created += result.created;
      updated += result.updated;

      for (const err of result.errors) {
        const originalIndex = chunk[err.index].originalIndex;
        errors.push(`Row ${originalIndex + 1}: ${err.message}`);
      }
    }

    return { created, updated, errors };
  }
}
