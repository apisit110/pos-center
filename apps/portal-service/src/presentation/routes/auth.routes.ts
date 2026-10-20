import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ServiceError } from '../../application/errors/ServiceError';
import { AuthController } from '../controllers/AuthController';
import { serviceAuthMiddleware } from '../middleware/AuthMiddleware';
import { requirePermission } from '../middleware/RbacMiddleware';
import { PERMISSION_GET_PROFILE } from '../../domain/constants/token';

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => next(ServiceError.ErrTooManyRequests()),
});

export function authRoutes(controller: AuthController, jwtSecret: string): Router {
  const router = Router();

  router.post('/login', loginRateLimiter, (req, res, next) => controller.login(req, res, next));
  router.post('/logout', (req, res, next) => controller.logout(req, res, next));
  router.get(
    '/me',
    serviceAuthMiddleware(jwtSecret),
    requirePermission(PERMISSION_GET_PROFILE),
    (req, res, next) => controller.getProfile(req, res, next),
  );

  return router;
}
