import { createHash, timingSafeEqual } from 'crypto';
import { IMerchantCredentialRepository } from '../../domain/repositories/IMerchantCredentialRepository';
import { Merchant } from '../../domain/entities/Merchant';
import { SyncError } from '../errors/SyncError';
import { AuthenticateMerchantCredentialRequest } from '../dtos/AuthenticateMerchantCredentialDto';

/** Authenticates the pos client by `partner_id` + merchant credential (`POS_CASHIER`) and returns its merchant. */
export class AuthenticateMerchantCredentialUseCase {
  constructor(private readonly merchantCredentialRepository: IMerchantCredentialRepository) {}

  async execute({ partnerId, clientId, clientSecret }: AuthenticateMerchantCredentialRequest): Promise<Merchant> {
    const credential = await this.merchantCredentialRepository.findByClientId(clientId);
    // same error for every case, do not tell which one is wrong
    if (
      !credential ||
      !this.isSecretMatch(clientSecret, credential.clientSecretHash) ||
      credential.merchant.partnerId !== partnerId
    ) {
      throw SyncError.invalidCredential();
    }

    return credential.merchant;
  }

  private isSecretMatch(clientSecret: string, clientSecretHash: string): boolean {
    const hash = Buffer.from(createHash('sha256').update(clientSecret).digest('hex'));
    const stored = Buffer.from(clientSecretHash);
    return hash.length === stored.length && timingSafeEqual(hash, stored);
  }
}
