import { Router } from 'express';
import { StaffController } from '../controllers/StaffController';
import { requirePermission } from '../middleware/RbacMiddleware';
import { PERMISSION_STAFFS_VIEW, PERMISSION_STAFF_DETAIL_VIEW } from '../../domain/constants/permissions';

export function staffRoutes(controller: StaffController): Router {
  const router = Router();

  router.get('/staff', requirePermission(PERMISSION_STAFFS_VIEW), (req, res, next) => controller.getAll(req, res, next));
  router.get('/staff/:id', requirePermission(PERMISSION_STAFF_DETAIL_VIEW), (req, res, next) => controller.getById(req, res, next));

  return router;
}
