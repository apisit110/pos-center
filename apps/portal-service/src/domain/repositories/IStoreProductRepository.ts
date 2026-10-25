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
  /**
   * Looks up stores and products of all inputs once, then upserts the valid rows in one transaction.
   * When `onlyMerchantUid` is given, a row whose store or product belongs to another merchant is
   * reported as FORBIDDEN and skipped.
   */
  batchUpsertByUids(inputs: UpsertStoreProductByUidInput[], onlyMerchantUid?: string): Promise<BatchUpsertResult>;
}
