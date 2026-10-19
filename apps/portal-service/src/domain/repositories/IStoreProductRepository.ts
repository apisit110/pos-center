import { StoreProduct } from '../../domain/entities/StoreProduct';

export interface UpsertStoreProductByUidInput {
  storeUid: string;
  productUid: string;
  stock: number;
  price: number;
}

export type StoreProductRowErrorCode = 'STORE_NOT_FOUND' | 'PRODUCT_NOT_FOUND' | 'FORBIDDEN';

export interface StoreProductRowError {
  /** index in the inputs given to batchUpsertByUids */
  index: number;
  code: StoreProductRowErrorCode;
  /** the store uid / product uid that was not found */
  uid?: string;
}

export interface BatchUpsertResult {
  created: number;
  updated: number;
  errors: StoreProductRowError[];
}

export interface IStoreProductRepository {
  save(storeProduct: StoreProduct): Promise<void>;
  findByStoreId(storeId: string): Promise<StoreProduct[]>;
  findByProductId(productId: string): Promise<StoreProduct[]>;
  delete(id: string): Promise<void>;
  upsertByUids(input: UpsertStoreProductByUidInput): Promise<'created' | 'updated'>;
  /**
   * Looks up stores and products of all inputs once, then upserts the valid rows in one transaction.
   * When `onlyMerchantUid` is given, a row whose store or product belongs to another merchant is
   * reported as FORBIDDEN and skipped.
   */
  batchUpsertByUids(inputs: UpsertStoreProductByUidInput[], onlyMerchantUid?: string): Promise<BatchUpsertResult>;
}
