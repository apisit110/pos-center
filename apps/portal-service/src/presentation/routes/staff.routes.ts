import { Router } from 'express';
import { StaffController } from '../controllers/StaffController';

export function staffRoutes(controller: StaffController): Router {
  const router = Router();

  router.get('/staff', (req, res, next) => controller.getAll(req, res, next));
  router.get('/staff/:id', (req, res, next) => controller.getById(req, res, next));

  return router;
}
