import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';

export function transactionRoutes(controller: TransactionController): Router {
  const router = Router();

  router.get('/transactions', (req, res, next) => controller.getAll(req, res, next));

  return router;
}
