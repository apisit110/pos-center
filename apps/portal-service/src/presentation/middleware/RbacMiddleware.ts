import { Request, Response, NextFunction } from 'express';
import { ServiceError } from '../../application/errors/ServiceError';

/** Requires `permission` in the `scope` claim of the access token; only valid behind serviceAuthMiddleware. */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.scope.includes(permission)) {
      return next(ServiceError.ErrPermissionDenied());
    }
    next();
  };
}
