import {
  BatchStoreProductMappingRequest,
  BatchStoreProductMappingResponse,
  StoreProductRepository
} from '../repositories/StoreProductRepository';

export class BatchUpsertStoreProductsUseCase {
  constructor(private readonly storeProductRepository: StoreProductRepository) {}

  public async execute(
    mappings: BatchStoreProductMappingRequest[]
  ): Promise<BatchStoreProductMappingResponse> {
    return this.storeProductRepository.batchUpsertMappings(mappings);
  }
}

