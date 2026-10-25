import { Request, Response, NextFunction } from 'express';
import { PullCashierProfileUseCase } from '../../application/usecases/PullCashierProfileUseCase';
import { buildPullCashierProfileResponse } from '../dtos/response/PullCashierProfileResponseDto';

export class CashierProfileSyncController {
  constructor(private readonly pullCashierProfileUseCase: PullCashierProfileUseCase) {}

  async pull(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(`[pos-sync-service] Pulling cashier profile for partner: ${req.syncAuth.partnerId}, terminal: ${req.syncAuth.tid}`);

      const { partnerId, tid } = req.syncAuth;
      const profile = await this.pullCashierProfileUseCase.execute({ partnerId, tid });

      return res.status(200).json(buildPullCashierProfileResponse(profile));
    } catch (error) {
      next(error);
    }
  }
}
