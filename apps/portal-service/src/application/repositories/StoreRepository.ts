import { Store } from '../../domain/entities/Store';

export interface StoreRepository {
  getById(id: string): Promise<Store | null>;
  getByMerchantId(merchantId: string): Promise<Store[]>;
  save(store: Store): Promise<void>;
}
