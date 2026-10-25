import { Request, Response, NextFunction } from 'express';
import { SyncOrdersFromClientUseCase } from '../../application/usecases/SyncOrdersFromClientUseCase';
import { GetSyncStateUseCase } from '../../application/usecases/GetSyncStateUseCase';
import { syncOrderRequestSchema } from '../dtos/request/SyncOrderRequestDto';
import { buildSyncOrdersResponse } from '../dtos/response/SyncOrdersResponseDto';
import { buildPushSyncState } from '../dtos/response/SyncStateResponseDto';
import { assertTokenScope } from '../middleware/SyncTokenMiddleware';

export class OrderSyncController {
  constructor(
    private readonly syncOrdersFromClientUseCase: SyncOrdersFromClientUseCase,
    private readonly getSyncStateUseCase: GetSyncStateUseCase
  ) {}

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = syncOrderRequestSchema.parse(req.body);
      const { orders } = validatedData;
      assertTokenScope(req.syncAuth, {
        partnerIds: orders.map(order => order.merchantId),
        sids: orders.map(order => order.storeId),
        tids: orders.map(order => order.terminalId),
      });
      console.log(`[pos-sync-service] Receiving ${orders.length} orders from client`);

      const result = await this.syncOrdersFromClientUseCase.execute({ orders });

      const syncState = await this.getSyncStateUseCase.executeOrNull(req.syncAuth);

      return res.status(200).json({ ...buildSyncOrdersResponse(result), ...buildPushSyncState(syncState) });
    } catch (error) {
      next(error);
    }
  }
}
