import { RequestHandler, Router } from 'express';
import rateLimit, { RateLimitInfo } from 'express-rate-limit';
import { PostgresRateLimitStore } from '@pos-center/database';
import { SyncError } from '../../application/errors/SyncError';
import { clientIp } from '../middleware/CloudFrontMiddleware';
import { ProductSyncController } from '../controllers/ProductSyncController';
import { OrderSyncController } from '../controllers/OrderSyncController';
import { TransactionSyncController } from '../controllers/TransactionSyncController';
import { CashierProfileSyncController } from '../controllers/CashierProfileSyncController';
import { SyncAuthController } from '../controllers/SyncAuthController';
import { SyncStateController } from '../controllers/SyncStateController';

// only failed requests count: guards the client secret against brute force and buggy clients retrying forever
const tokenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  // counted in postgres: every Lambda instance sees the same hits
  store: new PostgresRateLimitStore('sync-token'),
  // terminals of one shop share a public ip (and the docker gateway ip locally), so also key by client id
  keyGenerator: (req) => `${clientIp(req)}:${req.get('x-client-id') ?? ''}`,
  // X-Forwarded-For from CloudFront is expected and never trusted (clientIp reads CloudFront-Viewer-Address)
  validate: { xForwardedForHeader: false },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    // the client waits this long before requesting a token again
    const resetTime = (req as typeof req & { rateLimit?: RateLimitInfo }).rateLimit?.resetTime?.getTime();
    if (resetTime) res.set('Retry-After', String(Math.max(1, Math.ceil((resetTime - Date.now()) / 1000))));
    next(SyncError.tooManyTokenRequests());
  },
});

export const createSyncRouter = (
  productSyncController: ProductSyncController,
  orderSyncController: OrderSyncController,
  transactionSyncController: TransactionSyncController,
  cashierProfileSyncController: CashierProfileSyncController,
  syncAuthController: SyncAuthController,
  syncStateController: SyncStateController,
  syncTokenMiddleware: RequestHandler
): Router => {
  const router = Router();

  // merchant credential -> access token, the only api that receives the client secret
  router.post('/api/v1/sync/auth/token', tokenRateLimiter, (req, res, next) => syncAuthController.issueToken(req, res, next));

  // every other sync api requires the access token, sets req.syncAuth
  const auth = syncTokenMiddleware;

  // cheap check before the pulls: the client pulls products / cashier-profile only when their version changed
  router.post('/api/v1/sync/pull/state', auth, (req, res, next) => syncStateController.pull(req, res, next));

  router.post('/api/v1/sync/pull/cashier-profile', auth, (req, res, next) => cashierProfileSyncController.pull(req, res, next));

  router.post('/api/v1/sync/pull/products', auth, (req, res, next) => productSyncController.sync(req, res, next));
  router.post('/api/v1/sync/push/products', auth, (req, res, next) => productSyncController.receive(req, res, next));
  router.post('/api/v1/sync/push/orders', auth, (req, res, next) => orderSyncController.sync(req, res, next));
  router.post('/api/v1/sync/push/transactions', auth, (req, res, next) => transactionSyncController.sync(req, res, next));

  return router;
};
