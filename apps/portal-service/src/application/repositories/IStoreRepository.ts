import { Store } from '../../domain/entities/Store';

export interface IStoreRepository {
  getById(id: string): Promise<Store | null>;
  getByMerchantId(merchantId: string): Promise<Store[]>;
  findAll(): Promise<Store[]>;
  save(store: Store): Promise<void>;
}
