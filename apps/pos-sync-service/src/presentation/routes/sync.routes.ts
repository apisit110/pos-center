import { RequestHandler, Router } from 'express';
import { ProductSyncController } from '../controllers/ProductSyncController';
import { OrderSyncController } from '../controllers/OrderSyncController';
import { TransactionSyncController } from '../controllers/TransactionSyncController';
import { CashierProfileSyncController } from '../controllers/CashierProfileSyncController';
import { SyncAuthController } from '../controllers/SyncAuthController';

export const createSyncRouter = (
  productSyncController: ProductSyncController,
  orderSyncController: OrderSyncController,
  transactionSyncController: TransactionSyncController,
  cashierProfileSyncController: CashierProfileSyncController,
  syncAuthController: SyncAuthController,
  syncTokenMiddleware: RequestHandler
): Router => {
  const router = Router();

  // merchant credential -> access token, the only api that receives the client secret
  router.post('/api/v1/sync/auth/token', (req, res, next) => syncAuthController.issueToken(req, res, next));

  // every other sync api requires the access token, sets req.syncAuth
  const auth = syncTokenMiddleware;

  router.post('/api/v1/sync/pull/cashier-profile', auth, (req, res, next) => cashierProfileSyncController.pull(req, res, next));

  router.post('/api/v1/sync/pull/products', auth, (req, res, next) => productSyncController.sync(req, res, next));
  router.post('/api/v1/sync/products/receive', auth, (req, res, next) => productSyncController.receive(req, res, next));
  router.post('/api/v1/sync/push/orders', auth, (req, res, next) => orderSyncController.sync(req, res, next));
  router.post('/api/v1/sync/push/transactions', auth, (req, res, next) => transactionSyncController.sync(req, res, next));

  return router;
};
