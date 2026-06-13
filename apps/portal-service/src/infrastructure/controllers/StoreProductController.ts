import { Request, Response, NextFunction } from 'express';
import {
  BatchStoreProductMappingRequest,
  BatchUpsertStoreProductsUseCase
} from '../../domain/usecases/BatchUpsertStoreProductsUseCase';

export class StoreProductController {
  constructor(private readonly batchUpsertStoreProductsUseCase: BatchUpsertStoreProductsUseCase) {}

  async batchCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { mappings } = req.body as { mappings?: BatchStoreProductMappingRequest[] };

      if (!Array.isArray(mappings)) {
        return res.status(400).json({ message: 'mappings must be an array' });
      }
      const result = await this.batchUpsertStoreProductsUseCase.execute(mappings);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

