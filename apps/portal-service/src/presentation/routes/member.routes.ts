import { Router } from 'express';
import { MemberController } from '../controllers/MemberController';

export function memberRoutes(controller: MemberController): Router {
  const router = Router();

  router.get('/members', (req, res, next) => controller.getAll(req, res, next));
  router.get('/members/:id', (req, res, next) => controller.getById(req, res, next));

  return router;
}
