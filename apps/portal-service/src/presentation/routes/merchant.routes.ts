import { Router } from 'express';
import { MerchantController } from '../controllers/MerchantController';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { requireMerchantOwnership } from '../middleware/RbacMiddleware';

export function merchantRoutes(controller: MerchantController, staffRepository: IStaffRepository): Router {
  const router = Router();
  const ownershipByIdParam = requireMerchantOwnership(staffRepository, (req) => req.params.id);

  router.get('/merchants', (req, res, next) => controller.getAll(req, res, next));
  router.get('/merchants/:id/staff', ownershipByIdParam, (req, res, next) => controller.getStaff(req, res, next));
  router.get('/merchants/:id', ownershipByIdParam, (req, res, next) => controller.getById(req, res, next));
  router.post('/merchants', (req, res, next) => controller.register(req, res, next));

  return router;
}
