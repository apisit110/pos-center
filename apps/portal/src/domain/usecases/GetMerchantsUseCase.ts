import { Merchant } from '../entities/Merchant';
import { MerchantRepository, MerchantFilter } from '../repositories/MerchantRepository';

export class GetMerchantsUseCase {
  constructor(private merchantRepository: MerchantRepository) {}

  async execute(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }> {
    return this.merchantRepository.getMerchants(page, limit, filters);
  }
}
