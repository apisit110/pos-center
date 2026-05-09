import { StoreProduct } from '../../domain/entities/StoreProduct';

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
  getProductsByStore(storeId: string): Promise<StoreProduct[]>;
  updateStock(storeProductId: string, newStock: number): Promise<void>;
  updatePrice(storeProductId: string, newPrice: number): Promise<void>;
  batchUpsertMappings(
    mappings: BatchStoreProductMappingRequest[]
  ): Promise<BatchStoreProductMappingResponse>;
}
