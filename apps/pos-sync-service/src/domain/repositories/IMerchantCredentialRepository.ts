import { Merchant } from '../entities/Merchant';

export interface MerchantCredential {
  merchant: Merchant;
  clientSecretHash: string;
}

export interface IMerchantCredentialRepository {
  findByClientId(clientId: string): Promise<MerchantCredential | null>;
}
