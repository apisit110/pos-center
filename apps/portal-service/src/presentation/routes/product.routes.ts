import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

export function productRoutes(controller: ProductController): Router {
  const router = Router();

  router.get('/products', (req, res, next) => controller.getAll(req, res, next));
  router.get('/products/metadata', (req, res, next) => controller.getMetadata(req, res, next));
  router.post('/products/batch', (req, res, next) => controller.batchCreate(req, res, next));
  router.post('/products', (req, res, next) => controller.create(req, res, next));
  router.get('/products/:id', (req, res, next) => controller.getById(req, res, next));

  return router;
}
