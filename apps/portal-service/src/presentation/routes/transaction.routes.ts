import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { requirePermission } from '../middleware/AuthMiddleware';
import { PERMISSION_TRANSACTIONS_VIEW } from '../../domain/constants/permissions';

export function transactionRoutes(controller: TransactionController): Router {
  const router = Router();

  router.get('/transactions', requirePermission(PERMISSION_TRANSACTIONS_VIEW), (req, res, next) => controller.getAll(req, res, next));

  return router;
}
