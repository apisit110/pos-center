
export interface BatchStoreProductMappingRequest {
  store_uid: string;
  product_uid: string;
  stock: number;
  price: number;
}

export interface BatchStoreProductMappingResponse {
  created: number;
  updated: number;
  errors: string[];
}

export interface StoreProductRepository {
  batchUpsertMappings(
    mappings: BatchStoreProductMappingRequest[]
  ): Promise<BatchStoreProductMappingResponse>;
}
