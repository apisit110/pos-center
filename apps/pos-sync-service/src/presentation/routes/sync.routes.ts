import { Router } from 'express';
import { ProductSyncController } from '../controllers/ProductSyncController';
import { OrderSyncController } from '../controllers/OrderSyncController';
import { TransactionSyncController } from '../controllers/TransactionSyncController';

export const createSyncRouter = (
  productSyncController: ProductSyncController,
  orderSyncController: OrderSyncController,
  transactionSyncController: TransactionSyncController
): Router => {
  const router = Router();

  router.post('/v1/sync/products', (req, res, next) => productSyncController.sync(req, res, next));
  router.post('/v1/sync/products/receive', (req, res, next) => productSyncController.receive(req, res, next));
  router.post('/v1/sync/orders', (req, res, next) => orderSyncController.sync(req, res, next));
  router.post('/v1/sync/transactions', (req, res, next) => transactionSyncController.sync(req, res, next));

  return router;
};
