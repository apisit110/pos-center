import { MerchantRepository } from '../repositories/MerchantRepository';
import { Merchant } from '../../domain/entities/Merchant';

export class GetMerchantDetailUseCase {
  constructor(private merchantRepository: MerchantRepository) {}

  async execute(id: string): Promise<Merchant | null> {
    return this.merchantRepository.getById(id);
  }
}
