import { Request, Response, NextFunction } from 'express';
import { SyncUsersUseCase } from '../../application/usecases/SyncUsersUseCase';
import { syncUserRequestSchema } from '../dtos/request/SyncUserRequestDto';
import { buildSyncUsersResponse } from '../dtos/response/SyncUsersResponseDto';

export class UserSyncController {
  constructor(private readonly syncUsersUseCase: SyncUsersUseCase) {}

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = syncUserRequestSchema.parse(req.body);
      console.log(`[pos-sync-service] Syncing ${validatedData.users.length} users from POS`);

      const results = await this.syncUsersUseCase.execute(validatedData.users as any);

      return res.status(200).json(buildSyncUsersResponse(results));
    } catch (error) {
      next(error);
    }
  }
}
