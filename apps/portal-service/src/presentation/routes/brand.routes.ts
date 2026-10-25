import { Router } from 'express';
import { BrandController } from '../controllers/BrandController';
import { requirePermission } from '../middleware/RbacMiddleware';
import { PERMISSION_PRODUCTS_CREATE } from '../../domain/constants/permissions';

// brands are created by the product import, so they share its permission
export function brandRoutes(controller: BrandController): Router {
  const router = Router();

  router.post('/brands/batch', requirePermission(PERMISSION_PRODUCTS_CREATE), (req, res, next) => controller.batchCreate(req, res, next));

  return router;
}
