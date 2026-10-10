import { Router } from 'express';
import { StoreController } from '../controllers/StoreController';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { requireMerchantOwnership } from '../middleware/RbacMiddleware';

export function storeRoutes(controller: StoreController, staffRepository: IStaffRepository): Router {
  const router = Router();
  const ownershipByMerchantIdQuery = requireMerchantOwnership(
    staffRepository,
    (req) => (req.query.merchantId as string | undefined) || undefined
  );

  router.get('/stores', ownershipByMerchantIdQuery, (req, res, next) => controller.getAll(req, res, next));
  router.get('/stores/:id', (req, res, next) => controller.getById(req, res, next));
  router.get('/stores/:id/terminals', (req, res, next) => controller.getTerminals(req, res, next));

  return router;
}
