import { Merchant } from '../entities/Merchant';
import { MerchantRepository, MerchantRegistrationRequest } from '../repositories/MerchantRepository';

export class RegisterMerchantUseCase {
  constructor(private merchantRepository: MerchantRepository) {}

  public async execute(request: MerchantRegistrationRequest): Promise<Merchant> {
    return await this.merchantRepository.registerMerchant(request);
  }
}
