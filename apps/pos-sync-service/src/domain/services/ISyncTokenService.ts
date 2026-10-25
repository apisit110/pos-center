/** Terminal the sync token is issued for; only public ids, the client can read the token. */
export interface SyncTokenClaims {
  /** merchant `partner_id` */
  partnerId: string;
  /** store `sid` */
  sid: string;
  /** terminal `tid` */
  tid: string;
}

export interface IssuedSyncToken {
  accessToken: string;
  /** seconds */
  expiresIn: number;
}

export interface ISyncTokenService {
  sign(claims: SyncTokenClaims): IssuedSyncToken;
  /** throws SyncError invalidToken / tokenExpired */
  verify(token: string): SyncTokenClaims;
}
