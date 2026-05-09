import { IMerchantRepository } from '../repositories/IMerchantRepository';
import { Merchant } from '../../domain/entities/Merchant';

export class GetMerchantsUseCase {
  constructor(private merchantRepository: IMerchantRepository) {}

  async execute(): Promise<Merchant[]> {
    return this.merchantRepository.findAll();
  }
}
