import { Router } from 'express';
import { MerchantController } from '../controllers/MerchantController';
import { requirePermission } from '../middleware/RbacMiddleware';
import {
  PERMISSION_MERCHANTS_CREATE,
  PERMISSION_MERCHANTS_VIEW,
  PERMISSION_MERCHANT_DETAIL_VIEW,
  PERMISSION_MERCHANT_CREDENTIALS_CREATE,
  PERMISSION_MERCHANT_CREDENTIALS_ROTATE,
} from '../../domain/constants/permissions';

export function merchantRoutes(controller: MerchantController): Router {
  const router = Router();

  router.get('/merchants', requirePermission(PERMISSION_MERCHANTS_VIEW), (req, res, next) => controller.getAll(req, res, next));
  router.post('/merchants', requirePermission(PERMISSION_MERCHANTS_CREATE), (req, res, next) => controller.create(req, res, next));
  router.get('/merchants/:id/staff', requirePermission(PERMISSION_MERCHANT_DETAIL_VIEW), (req, res, next) => controller.getStaff(req, res, next));
  router.get('/merchants/:id', requirePermission(PERMISSION_MERCHANT_DETAIL_VIEW), (req, res, next) => controller.getById(req, res, next));
  router.post('/merchants/:id/credentials', requirePermission(PERMISSION_MERCHANT_CREDENTIALS_CREATE), (req, res, next) => controller.createCredential(req, res, next));
  router.post('/merchants/:id/credentials/rotate', requirePermission(PERMISSION_MERCHANT_CREDENTIALS_ROTATE), (req, res, next) => controller.rotateCredential(req, res, next));

  return router;
}
