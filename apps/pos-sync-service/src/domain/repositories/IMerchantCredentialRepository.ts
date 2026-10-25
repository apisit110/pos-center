import { Merchant } from '../entities/Merchant';

export interface MerchantCredentialDTO {
  merchant: Merchant;
  clientSecretHash: string;
}

export interface IMerchantCredentialRepository {
  findByClientId(clientId: string): Promise<MerchantCredentialDTO | null>;
}
