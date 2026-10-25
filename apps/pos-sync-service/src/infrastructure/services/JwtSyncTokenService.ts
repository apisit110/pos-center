import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { ISyncTokenService, IssuedSyncToken, SyncTokenClaims } from '../../domain/services/ISyncTokenService';
import { SYNC_TOKEN_AUDIENCE, SYNC_TOKEN_EXPIRES_IN, SYNC_TOKEN_ISSUER } from '../../domain/constants/token';
import { SyncError } from '../../application/errors/SyncError';

const ALGORITHM = 'HS256';

const tokenPayloadSchema = z.object({
  sub: z.string().min(1), // terminal tid
  mid: z.string().min(1), // merchant partner_id
  sid: z.string().min(1), // store sid
});

export class JwtSyncTokenService implements ISyncTokenService {
  constructor(private readonly jwtSecret: string) {}

  sign({ partnerId, sid, tid }: SyncTokenClaims): IssuedSyncToken {
    const accessToken = jwt.sign({ mid: partnerId, sid }, this.jwtSecret, {
      algorithm: ALGORITHM,
      issuer: SYNC_TOKEN_ISSUER,
      audience: SYNC_TOKEN_AUDIENCE,
      subject: tid,
      jwtid: uuidv4(),
      expiresIn: SYNC_TOKEN_EXPIRES_IN,
    });
    return { accessToken, expiresIn: SYNC_TOKEN_EXPIRES_IN };
  }

  verify(token: string): SyncTokenClaims {
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, this.jwtSecret, {
        algorithms: [ALGORITHM],
        issuer: SYNC_TOKEN_ISSUER,
        audience: SYNC_TOKEN_AUDIENCE,
      }) as jwt.JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) throw SyncError.tokenExpired();
      throw SyncError.invalidToken();
    }

    const claims = tokenPayloadSchema.safeParse(payload);
    if (!claims.success) throw SyncError.invalidToken();

    return { partnerId: claims.data.mid, sid: claims.data.sid, tid: claims.data.sub };
  }
}
