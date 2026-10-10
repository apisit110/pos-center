export interface AccessTokenPayload {
  uid: string;
  role: string;
  permissions: string[];
}

export interface ITokenService {
  signAccessToken(payload: AccessTokenPayload): string;
}
