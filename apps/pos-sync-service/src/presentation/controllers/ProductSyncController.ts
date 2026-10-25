import { Request, Response, NextFunction } from 'express';
import { SyncPOSProductsUseCase } from '../../application/usecases/SyncPOSProductsUseCase';
import { ReceiveProductsFromClientUseCase } from '../../application/usecases/ReceiveProductsFromClientUseCase';
import { syncProductRequestSchema } from '../dtos/request/SyncProductRequestDto';
import { receiveProductsRequestSchema } from '../dtos/request/ReceiveProductsRequestDto';
import { buildSyncProductsSuccessResponse, buildSyncProductsFailureResponse } from '../dtos/response/SyncProductsResponseDto';
import { buildReceiveProductsResponse } from '../dtos/response/ReceiveProductsResponseDto';
import { assertTokenScope } from '../middleware/SyncTokenMiddleware';

export class ProductSyncController {
  constructor(
    private readonly syncPOSProductsUseCase: SyncPOSProductsUseCase,
    private readonly receiveProductsFromClientUseCase: ReceiveProductsFromClientUseCase
  ) {}

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = syncProductRequestSchema.parse(req.body);
      const { mid, sid: bodySid, syncVersion } = validatedData;
      assertTokenScope(req.syncAuth, { partnerIds: mid ? [mid] : [], sids: bodySid ? [bodySid] : [] });
      const { partnerId, sid } = req.syncAuth;

      console.log(`[pos-sync-service] Triggering sync for merchant: ${partnerId}, store: ${sid}, version: ${syncVersion}`);

      const result = await this.syncPOSProductsUseCase.execute({ partnerId, sid, syncVersion });

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
      const { mid, sid: bodySid, products } = validatedData;
      assertTokenScope(req.syncAuth, { partnerIds: mid ? [mid] : [], sids: bodySid ? [bodySid] : [] });
      const { partnerId, sid } = req.syncAuth;

      console.log(`[pos-sync-service] Receiving ${products.length} product(s) from merchant: ${partnerId}, store: ${sid}`);

      const result = await this.receiveProductsFromClientUseCase.execute({ partnerId, sid, products });

      return res.status(200).json(buildReceiveProductsResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
