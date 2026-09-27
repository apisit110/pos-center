import { Request, Response, NextFunction } from 'express';
import { SyncPOSProductsUseCase } from '../../application/usecases/SyncPOSProductsUseCase';
import { ReceiveProductsFromClientUseCase } from '../../application/usecases/ReceiveProductsFromClientUseCase';
import { syncProductRequestSchema } from '../dtos/request/SyncProductRequestDto';
import { receiveProductsRequestSchema } from '../dtos/request/ReceiveProductsRequestDto';
import { buildSyncProductsSuccessResponse, buildSyncProductsFailureResponse } from '../dtos/response/SyncProductsResponseDto';
import { buildReceiveProductsResponse } from '../dtos/response/ReceiveProductsResponseDto';

export class ProductSyncController {
  constructor(
    private readonly syncPOSProductsUseCase: SyncPOSProductsUseCase,
    private readonly receiveProductsFromClientUseCase: ReceiveProductsFromClientUseCase
  ) {}

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = syncProductRequestSchema.parse(req.body);
      const { mid, sid, syncVersion } = validatedData;

      console.log(`[pos-sync-service] Triggering sync for merchant: ${mid}, store: ${sid}, version: ${syncVersion}`);

      const result = await this.syncPOSProductsUseCase.execute(mid, sid, syncVersion);

      if (result.success) {
        return res.status(200).json(buildSyncProductsSuccessResponse(result.products));
      } else {
        return res.status(500).json(buildSyncProductsFailureResponse());
      }
    } catch (error) {
      next(error);
    }
  }

  async receive(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = receiveProductsRequestSchema.parse(req.body);
      const { mid, sid, products } = validatedData;

      console.log(`[pos-sync-service] Receiving ${products.length} product(s) from merchant: ${mid}, store: ${sid}`);

      const results = await this.receiveProductsFromClientUseCase.execute(mid, sid, products);

      return res.status(200).json(buildReceiveProductsResponse(results));
    } catch (error) {
      next(error);
    }
  }
}
