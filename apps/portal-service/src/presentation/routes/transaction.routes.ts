import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { requirePermission } from '../middleware/RbacMiddleware';
import { PERMISSION_TRANSACTIONS_VIEW, PERMISSION_TRANSACTION_DETAIL_VIEW } from '../../domain/constants/permissions';

export function transactionRoutes(controller: TransactionController): Router {
  const router = Router();

  router.get('/transactions', requirePermission(PERMISSION_TRANSACTIONS_VIEW), (req, res, next) => controller.getAll(req, res, next));
  router.get('/transactions/:id', requirePermission(PERMISSION_TRANSACTION_DETAIL_VIEW), (req, res, next) => controller.getById(req, res, next));

  return router;
}
