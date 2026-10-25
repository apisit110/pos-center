import { IssueSyncTokenResponse } from '../../../application/dtos/IssueSyncTokenDto';

export interface IssueSyncTokenResponseDto {
  access_token: string;
  token_type: 'Bearer';
  /** seconds */
  expires_in: number;
}

export const buildIssueSyncTokenResponse = ({ accessToken, expiresIn }: IssueSyncTokenResponse): IssueSyncTokenResponseDto => ({
  access_token: accessToken,
  token_type: 'Bearer',
  expires_in: expiresIn,
});
