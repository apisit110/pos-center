import { IssuedSyncToken } from '../../../domain/services/ISyncTokenService';

export const buildIssueSyncTokenResponse = ({ accessToken, expiresIn }: IssuedSyncToken) => ({
  access_token: accessToken,
  token_type: 'Bearer',
  expires_in: expiresIn,
});
