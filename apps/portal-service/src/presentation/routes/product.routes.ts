import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { requirePermission } from '../middleware/AuthMiddleware';
import {
  PERMISSION_PRODUCTS_CREATE,
  PERMISSION_PRODUCTS_VIEW,
  PERMISSION_PRODUCT_DETAIL_VIEW,
} from '../../domain/constants/permissions';

export function productRoutes(controller: ProductController): Router {
  const router = Router();

  router.get('/products', requirePermission(PERMISSION_PRODUCTS_VIEW), (req, res, next) => controller.getAll(req, res, next));
  router.get('/products/metadata', requirePermission(PERMISSION_PRODUCTS_VIEW), (req, res, next) => controller.getMetadata(req, res, next));
  router.post('/products/batch', requirePermission(PERMISSION_PRODUCTS_CREATE), (req, res, next) => controller.batchCreate(req, res, next));
  router.post('/products', requirePermission(PERMISSION_PRODUCTS_CREATE), (req, res, next) => controller.create(req, res, next));
  router.get('/products/:id', requirePermission(PERMISSION_PRODUCT_DETAIL_VIEW), (req, res, next) => controller.getById(req, res, next));

  return router;
}
