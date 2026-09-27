import { Router } from 'express';
import { StoreController } from '../controllers/StoreController';

export function storeRoutes(controller: StoreController): Router {
  const router = Router();

  router.get('/stores', (req, res, next) => controller.getAll(req, res, next));
  router.get('/stores/:id', (req, res, next) => controller.getById(req, res, next));
  router.get('/stores/:id/terminals', (req, res, next) => controller.getTerminals(req, res, next));

  return router;
}
