import { Request, Response, NextFunction } from 'express';
import { BatchUpsertStoreProductsUseCase } from '../../application/usecases/BatchUpsertStoreProductsUseCase';
import {
  batchUpsertStoreProductsSchema,
  coerceNumber,
  coerceString,
} from '../dtos/request/BatchUpsertStoreProductsRequestDto';
import { StoreProductBatchUpsertResponseDto } from '../dtos/response/StoreProductResponseDto';
import { actorOf } from '../middleware/AuthMiddleware';
import { sendOk } from './respond';

export class StoreProductController {
  constructor(private readonly batchUpsertStoreProductsUseCase: BatchUpsertStoreProductsUseCase) {}

  async batchCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { mappings } = batchUpsertStoreProductsSchema.parse(req.body);

      const result = await this.batchUpsertStoreProductsUseCase.execute(
        actorOf(req),
        mappings.map((mapping) => ({
          storeUid: coerceString(mapping.store_uid),
          productUid: coerceString(mapping.product_uid),
          stock: coerceNumber(mapping.stock),
          price: coerceNumber(mapping.price),
        })),
      );
      sendOk<StoreProductBatchUpsertResponseDto>(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
