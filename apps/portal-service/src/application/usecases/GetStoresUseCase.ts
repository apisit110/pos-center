import { IStoreRepository } from '../../domain/repositories/IStoreRepository';
import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { Store } from '../../domain/entities/Store';
import { NotFoundError } from '../errors/CommonErrors';

export class GetStoresUseCase {
  constructor(
    private storeRepository: IStoreRepository,
    private merchantRepository: IMerchantRepository
  ) {}

  async execute(merchantId?: string): Promise<Store[]> {
    if (merchantId) {
      const merchant = await this.merchantRepository.getById(merchantId);
      if (!merchant) throw new NotFoundError('Merchant not found');
      return this.storeRepository.getByMerchantId(merchantId);
    }
    return this.storeRepository.findAll();
  }
}
