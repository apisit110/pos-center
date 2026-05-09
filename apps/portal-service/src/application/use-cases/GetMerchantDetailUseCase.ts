import { IMerchantRepository } from '../repositories/IMerchantRepository';
import { Merchant } from '../../domain/entities/Merchant';

export class GetMerchantDetailUseCase {
  constructor(private merchantRepository: IMerchantRepository) {}

  async execute(uid: string): Promise<Merchant | null> {
    return this.merchantRepository.getById(uid);
  }
}
