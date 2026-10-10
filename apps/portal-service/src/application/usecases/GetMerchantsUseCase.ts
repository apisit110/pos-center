import { IMerchantRepository, MerchantFilter } from '../../domain/repositories/IMerchantRepository';
import { Merchant } from '../../domain/entities/Merchant';

export class GetMerchantsUseCase {
  constructor(private merchantRepository: IMerchantRepository) {}

  async execute(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }> {
    return this.merchantRepository.findAll(page, limit, filters);
  }
}
