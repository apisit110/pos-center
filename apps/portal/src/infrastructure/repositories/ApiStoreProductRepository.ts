import {
  BatchStoreProductMappingRequest,
  BatchStoreProductMappingResponse,
  StoreProductRepository
} from '../../domain/repositories/StoreProductRepository';
import ApiClient, { API_V1, unwrap } from '../api/ApiClient';

const STORE_PRODUCTS_PATH = `${API_V1}/store-products`;
// max items per batch request (see docs/portal/flow/store-product/post-store-products-batch.md)
const BATCH_CHUNK_SIZE = 1000;

export class ApiStoreProductRepository implements StoreProductRepository {
  public async batchUpsertMappings(
    mappings: BatchStoreProductMappingRequest[]
  ): Promise<BatchStoreProductMappingResponse> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let offset = 0; offset < mappings.length; offset += BATCH_CHUNK_SIZE) {
      const chunk = mappings.slice(offset, offset + BATCH_CHUNK_SIZE);
      const response = await ApiClient.post(`${STORE_PRODUCTS_PATH}/batch`, { mappings: chunk });
      const data = unwrap<BatchStoreProductMappingResponse>(response);
      created += data.created ?? 0;
      updated += data.updated ?? 0;
      for (const message of data.errors ?? []) {
        // messages are `Row <n>: <reason>` with n relative to the chunk; shift n by the chunk offset
        errors.push(message.replace(/^Row (\d+):/, (_, n) => `Row ${Number(n) + offset}:`));
      }
    }

    return { created, updated, errors };
  }
}
