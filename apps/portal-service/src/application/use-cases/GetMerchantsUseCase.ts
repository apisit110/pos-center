import { MerchantRepository } from '../repositories/MerchantRepository';
import { Merchant } from '../../domain/entities/Merchant';

export class GetMerchantsUseCase {
  constructor(private merchantRepository: MerchantRepository) {}

  async execute(): Promise<Merchant[]> {
    return this.merchantRepository.findAll();
  }
}
