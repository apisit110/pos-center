import { Router } from 'express';
import { StoreController } from '../controllers/StoreController';
import { requirePermission } from '../middleware/RbacMiddleware';
import {
  PERMISSION_STORES_VIEW,
  PERMISSION_STORE_DETAIL_VIEW,
  PERMISSION_TERMINALS_VIEW,
} from '../../domain/constants/permissions';

export function storeRoutes(controller: StoreController): Router {
  const router = Router();

  router.get('/stores', requirePermission(PERMISSION_STORES_VIEW), (req, res, next) => controller.getAll(req, res, next));
  router.get('/stores/:id/terminals', requirePermission(PERMISSION_TERMINALS_VIEW), (req, res, next) => controller.getTerminals(req, res, next));
  router.get('/stores/:id', requirePermission(PERMISSION_STORE_DETAIL_VIEW), (req, res, next) => controller.getById(req, res, next));

  return router;
}
