import { Store } from '../../domain/entities/Store';

export interface StoreRepository {
  getStores(merchantId: string): Promise<Store[]>;
  getStoreById(id: string): Promise<Store | null>;
  saveStore(store: Store): Promise<void>;
}
