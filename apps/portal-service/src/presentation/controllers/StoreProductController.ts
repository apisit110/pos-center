import { Request, Response, NextFunction } from 'express';
import { BatchUpsertStoreProductsUseCase } from '../../application/usecases/BatchUpsertStoreProductsUseCase';
import { batchUpsertStoreProductsSchema } from '../dtos/request/BatchUpsertStoreProductsRequestDto';
import { StoreProductBatchUpsertResponseDto } from '../dtos/response/StoreProductResponseDto';

export class StoreProductController {
  constructor(private readonly batchUpsertStoreProductsUseCase: BatchUpsertStoreProductsUseCase) {}

  async batchCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { mappings } = batchUpsertStoreProductsSchema.parse(req.body);

      const result = await this.batchUpsertStoreProductsUseCase.execute(mappings);
      const response: StoreProductBatchUpsertResponseDto = result;
      return res.status(201).json(response);
    } catch (error) {
      return next(error);
    }
  }
}
