import { Store } from '../entities/Store';
import { StoreRepository } from '../repositories/StoreRepository';

export class GetStoresUseCase {
  constructor(private storeRepository: StoreRepository) {}

  async execute(merchantId?: string): Promise<Store[]> {
    return this.storeRepository.getStores(merchantId);
  }
}
