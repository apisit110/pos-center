import { Router } from 'express';
import { StoreProductController } from '../controllers/StoreProductController';
import { requirePermission } from '../middleware/AuthMiddleware';
import { PERMISSION_STORE_PRODUCTS_CREATE } from '../../domain/constants/permissions';

export function storeProductRoutes(controller: StoreProductController): Router {
  const router = Router();

  router.post('/store-products/batch', requirePermission(PERMISSION_STORE_PRODUCTS_CREATE), (req, res, next) => controller.batchCreate(req, res, next));

  return router;
}
