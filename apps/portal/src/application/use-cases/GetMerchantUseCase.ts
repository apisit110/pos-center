import { Merchant } from '../../domain/entities/Merchant';
import { MerchantRepository } from '../repositories/MerchantRepository';

export class GetMerchantUseCase {
  constructor(private merchantRepository: MerchantRepository) {}

  async execute(uid: string): Promise<Merchant | null> {
    return this.merchantRepository.getMerchant(uid);
  }
}
