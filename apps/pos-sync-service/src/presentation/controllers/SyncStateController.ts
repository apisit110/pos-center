import { Request, Response, NextFunction } from 'express';
import { GetSyncStateUseCase } from '../../application/usecases/GetSyncStateUseCase';
import { buildPullSyncStateResponse } from '../dtos/response/SyncStateResponseDto';

export class SyncStateController {
  constructor(private readonly getSyncStateUseCase: GetSyncStateUseCase) {}

  async pull(req: Request, res: Response, next: NextFunction) {
    try {
      const syncState = await this.getSyncStateUseCase.execute(req.syncAuth);

      return res.status(200).json(buildPullSyncStateResponse(syncState));
    } catch (error) {
      next(error);
    }
  }
}
