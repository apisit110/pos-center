import { Merchant } from '../../domain/entities/Merchant';
import { MerchantCredential } from '../../domain/entities/MerchantCredential';
import { MerchantCredentialProvider } from '../../domain/constants/merchantCredential';
import { Staff } from '../../domain/entities/Staff';
import { Store } from '../../domain/entities/Store';
import { Terminal } from '../../domain/entities/Terminal';
import { ResolvedAddress } from './IAddressRepository';

export interface MerchantFilter {
  partnerId?: string;
  /** matches name_en or name_th */
  name?: string;
}

export interface NewCashierStaff {
  staff: Staff;
  roleId: number;
}

export interface NewStore {
  store: Store;
  registeredAddress: ResolvedAddress;
  contractAddress: ResolvedAddress;
  terminals: Terminal[];
}

export type CreateCredentialResult =
  | { status: 'created'; credential: MerchantCredential }
  | { status: 'provider_exists' }
  | { status: 'client_id_taken' };

export interface IMerchantRepository {
  getById(uid: string): Promise<Merchant | null>;
  getByPartnerId(partnerId: string): Promise<Merchant | null>;
  /** Credentials of the merchant ordered by provider, never with the client secret. */
  getCredentials(merchantUid: string): Promise<MerchantCredential[]>;
  getCredential(merchantUid: string, provider: MerchantCredentialProvider): Promise<MerchantCredential | null>;
  /** Unique `(merchant, provider)` and `client_id` violations are reported in the result instead of thrown. */
  createCredential(merchantUid: string, provider: MerchantCredentialProvider, clientId: string, clientSecretHash: string): Promise<CreateCredentialResult>;
  /** Null when the merchant has no credential for the provider. */
  updateCredentialSecret(merchantUid: string, provider: MerchantCredentialProvider, clientSecretHash: string): Promise<MerchantCredential | null>;
  /** Ordered by internal id ascending. */
  findAll(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }>;
  /** Saves the merchant with its cashier staff, stores (with addresses) and terminals in one transaction (all or nothing). */
  createWithMembers(merchant: Merchant, cashierStaff: NewCashierStaff[], stores: NewStore[]): Promise<void>;
}
