import { Router } from 'express';
import { StoreProductController } from '../controllers/StoreProductController';

export function storeProductRoutes(controller: StoreProductController): Router {
  const router = Router();

  router.post('/store-products/batch', (req, res, next) => controller.batchCreate(req, res, next));

  return router;
}
