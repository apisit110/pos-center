import { Request, Response, NextFunction } from 'express';
import { SyncOrdersFromClientUseCase } from '../../application/usecases/SyncOrdersFromClientUseCase';
import { syncOrderRequestSchema } from '../dtos/request/SyncOrderRequestDto';
import { buildSyncOrdersResponse } from '../dtos/response/SyncOrdersResponseDto';

export class OrderSyncController {
  constructor(private readonly syncOrdersFromClientUseCase: SyncOrdersFromClientUseCase) {}

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = syncOrderRequestSchema.parse(req.body);
      console.log(`[pos-sync-service] Receiving ${validatedData.orders.length} orders from client`);

      const results = await this.syncOrdersFromClientUseCase.execute(validatedData.orders as any);

      return res.status(200).json(buildSyncOrdersResponse(results));
    } catch (error) {
      next(error);
    }
  }
}
