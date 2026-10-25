import { IssuedMerchantCredential, MerchantCredentialProvider } from '../entities/Merchant';
import { MerchantRepository } from '../repositories/MerchantRepository';

export class CreateMerchantCredentialUseCase {
  constructor(private merchantRepository: MerchantRepository) {}

  async execute(merchantUid: string, provider: MerchantCredentialProvider): Promise<IssuedMerchantCredential> {
    return this.merchantRepository.createCredential(merchantUid, provider);
  }
}
