import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { MerchantCredential } from '../../domain/entities/MerchantCredential';
import { MerchantCredentialProvider } from '../../domain/constants/merchantCredential';
import { ServiceError } from '../errors/ServiceError';
import { generateClientId, generateClientSecret, hashClientSecret } from '../utils/merchantCredential';

export interface IssuedMerchantCredential {
  merchantUid: string;
  credential: MerchantCredential;
  /** plain secret, returned only once */
  clientSecret: string;
}

const MAX_CLIENT_ID_ATTEMPTS = 10;

/** Creates the credential of a merchant for a provider; only the hash of the secret is stored. */
export class CreateMerchantCredentialUseCase {
  constructor(private readonly merchantRepository: IMerchantRepository) {}

  public async execute(merchantUid: string, provider: MerchantCredentialProvider): Promise<IssuedMerchantCredential> {
    const merchant = await this.merchantRepository.getById(merchantUid);
    if (!merchant) throw ServiceError.ErrMerchantNotFound();

    if (await this.merchantRepository.getCredential(merchant.uid, provider)) {
      throw ServiceError.ErrMerchantCredentialExists();
    }

    const clientSecret = generateClientSecret();
    const clientSecretHash = hashClientSecret(clientSecret);

    for (let attempt = 0; attempt < MAX_CLIENT_ID_ATTEMPTS; attempt++) {
      const result = await this.merchantRepository.createCredential(merchant.uid, provider, generateClientId(), clientSecretHash);
      if (result.status === 'created') {
        return { merchantUid: merchant.uid, credential: result.credential, clientSecret };
      }
      // a concurrent request created it first
      if (result.status === 'provider_exists') throw ServiceError.ErrMerchantCredentialExists();
      // client_id collision: retry with a new one
    }
    throw new Error('Could not generate a unique client_id');
  }
}
