import { StoreProduct } from '../../domain/entities/StoreProduct';

export interface UpsertStoreProductByUidInput {
  storeUid: string;
  productUid: string;
  stock: number;
  price: number;
}

export interface IStoreProductRepository {
  save(storeProduct: StoreProduct): Promise<void>;
  findByStoreId(storeId: string): Promise<StoreProduct[]>;
  findByProductId(productId: string): Promise<StoreProduct[]>;
  delete(id: string): Promise<void>;
  upsertByUids(input: UpsertStoreProductByUidInput): Promise<'created' | 'updated'>;
}
