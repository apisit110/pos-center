import { IStoreRepository } from '../repositories/IStoreRepository';
import { Store } from '../../domain/entities/Store';

export class GetStoresUseCase {
  constructor(private storeRepository: IStoreRepository) {}

  async execute(merchantId?: string): Promise<Store[]> {
    if (merchantId) {
      return this.storeRepository.getByMerchantId(merchantId);
    }
    return this.storeRepository.findAll();
  }
}
