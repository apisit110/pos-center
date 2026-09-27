import { Router } from 'express';
import { MerchantController } from '../controllers/MerchantController';

export function merchantRoutes(controller: MerchantController): Router {
  const router = Router();

  router.get('/merchants', (req, res, next) => controller.getAll(req, res, next));
  router.get('/merchants/:id/staff', (req, res, next) => controller.getStaff(req, res, next));
  router.get('/merchants/:id', (req, res, next) => controller.getById(req, res, next));
  router.post('/merchants', (req, res, next) => controller.register(req, res, next));

  return router;
}
