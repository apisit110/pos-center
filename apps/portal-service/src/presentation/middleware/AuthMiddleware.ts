import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { SCOPE_SEPARATOR, TOKEN_AUDIENCE, TOKEN_ISSUER } from '../../domain/constants/token';
import { ServiceError } from '../../application/errors/ServiceError';
import { ValidationError } from '../../application/errors/ValidationError';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: { uid: string; role: string; scope: string[] };
    }
  }
}

const BEARER_PREFIX = 'Bearer ';

const tokenPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.string().min(1),
  scope: z.string(),
});

function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith(BEARER_PREFIX)) return header.slice(BEARER_PREFIX.length);
  return req.cookies?.token;
}

/** Verifies the access token and returns its claims. Throws ServiceError / ValidationError. */
function verifyAccessToken(req: Request, jwtSecret: string): NonNullable<Request['auth']> {
  const token = extractToken(req);
  if (!token) throw ServiceError.ErrTokenInvalide();

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, jwtSecret, {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    }) as jwt.JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) throw ServiceError.ErrTokenExpire();
    throw ServiceError.ErrTokenInvalide();
  }

  const claims = tokenPayloadSchema.safeParse(payload);
  if (!claims.success) throw ValidationError.ErrInvalidRequest();

  return {
    uid: claims.data.sub,
    role: claims.data.role,
    scope: claims.data.scope === '' ? [] : claims.data.scope.split(SCOPE_SEPARATOR),
  };
}

/** Legacy behaviour (401 { message }) used by endpoints that have not been refactored yet. */
export function authMiddleware(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.auth = verifyAccessToken(req, jwtSecret);
      next();
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

/** Same verification, but forwards ServiceError / ValidationError to ErrorMiddleware. */
export function serviceAuthMiddleware(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.auth = verifyAccessToken(req, jwtSecret);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.scope.includes(permission)) {
      return next(ServiceError.ErrPermissionDenied());
    }
    next();
  };
}
