import { IssuedSyncToken } from '../../domain/services/ISyncTokenService';
import { AuthenticateMerchantCredentialRequest } from './AuthenticateMerchantCredentialDto';

export interface IssueSyncTokenRequest extends AuthenticateMerchantCredentialRequest {
  /** terminal `tid` the token is issued for */
  tid: string;
}

export type IssueSyncTokenResponse = IssuedSyncToken;
