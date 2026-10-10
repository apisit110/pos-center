import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { ITokenService, AccessTokenPayload } from '../../domain/services/ITokenService';
import {
  TOKEN_ISSUER,
  TOKEN_AUDIENCE,
  ACCESS_TOKEN_EXPIRES_IN,
  SCOPE_SEPARATOR,
} from '../../domain/constants/token';

export class JwtTokenService implements ITokenService {
  constructor(private jwtSecret: string) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(
      { role: payload.role, scope: payload.permissions.join(SCOPE_SEPARATOR) },
      this.jwtSecret,
      {
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
        subject: payload.uid,
        jwtid: uuidv4(),
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    );
  }
}
