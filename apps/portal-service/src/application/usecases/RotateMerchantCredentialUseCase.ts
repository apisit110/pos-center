import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { MerchantCredentialProvider } from '../../domain/constants/merchantCredential';
import { ServiceError } from '../errors/ServiceError';
import { generateClientSecret, hashClientSecret } from '../utils/merchantCredential';
import { IssuedMerchantCredential } from './CreateMerchantCredentialUseCase';

/** Replaces the secret of a merchant credential (client_id unchanged); the old secret stops working immediately. */
export class RotateMerchantCredentialUseCase {
  constructor(private readonly merchantRepository: IMerchantRepository) {}

  public async execute(merchantUid: string, provider: MerchantCredentialProvider): Promise<IssuedMerchantCredential> {
    const merchant = await this.merchantRepository.getById(merchantUid);
    if (!merchant) throw ServiceError.ErrMerchantNotFound();

    const clientSecret = generateClientSecret();
    const credential = await this.merchantRepository.updateCredentialSecret(merchant.uid, provider, hashClientSecret(clientSecret));
    if (!credential) throw ServiceError.ErrMerchantCredentialNotFound();

    return { merchantUid: merchant.uid, credential, clientSecret };
  }
}
