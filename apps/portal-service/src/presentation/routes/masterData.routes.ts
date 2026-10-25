import { Router } from 'express';
import { MasterDataController } from '../controllers/MasterDataController';
import { requirePermission } from '../middleware/RbacMiddleware';
import { PERMISSION_MERCHANTS_CREATE } from '../../domain/constants/permissions';

// the address master data is only used by the create merchant form, so it shares its permission
export function masterDataRoutes(controller: MasterDataController): Router {
  const router = Router();

  router.get('/master-data/provinces', requirePermission(PERMISSION_MERCHANTS_CREATE), (req, res, next) => controller.getProvinces(req, res, next));
  router.get('/master-data/districts', requirePermission(PERMISSION_MERCHANTS_CREATE), (req, res, next) => controller.getDistricts(req, res, next));
  router.get('/master-data/sub-districts', requirePermission(PERMISSION_MERCHANTS_CREATE), (req, res, next) => controller.getSubDistricts(req, res, next));
  router.get('/master-data/postal-codes', requirePermission(PERMISSION_MERCHANTS_CREATE), (req, res, next) => controller.getPostalCodes(req, res, next));

  return router;
}
