import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/AuthMiddleware';

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later' },
});

export function authRoutes(controller: AuthController, jwtSecret: string): Router {
  const router = Router();

  router.post('/login', loginRateLimiter, (req, res, next) => controller.login(req, res, next));
  router.post('/logout', (req, res, next) => controller.logout(req, res, next));
  router.get('/me', authMiddleware(jwtSecret), (req: Request, res: Response) => {
    res.status(200).json({ auth: req.auth });
  });

  return router;
}
