import { Merchant } from '../../domain/entities/Merchant';
import { MerchantRepository } from '../repositories/MerchantRepository';

export class GetMerchantsUseCase {
  constructor(private merchantRepository: MerchantRepository) {}

  async execute(): Promise<Merchant[]> {
    return this.merchantRepository.getMerchants();
  }
}
