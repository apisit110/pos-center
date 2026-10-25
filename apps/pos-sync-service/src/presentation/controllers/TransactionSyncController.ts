import { Request, Response, NextFunction } from 'express';
import { SyncTransactionsFromClientUseCase } from '../../application/usecases/SyncTransactionsFromClientUseCase';
import { GetSyncStateUseCase } from '../../application/usecases/GetSyncStateUseCase';
import { syncTransactionRequestSchema } from '../dtos/request/SyncTransactionRequestDto';
import { buildSyncTransactionsResponse } from '../dtos/response/SyncTransactionsResponseDto';
import { buildPushSyncState } from '../dtos/response/SyncStateResponseDto';
import { assertTokenScope } from '../middleware/SyncTokenMiddleware';

export class TransactionSyncController {
  constructor(
    private readonly syncTransactionsFromClientUseCase: SyncTransactionsFromClientUseCase,
    private readonly getSyncStateUseCase: GetSyncStateUseCase
  ) {}

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = syncTransactionRequestSchema.parse(req.body);
      const { transactions } = validatedData;
      assertTokenScope(req.syncAuth, {
        partnerIds: transactions.map(tx => tx.merchantId),
        sids: transactions.map(tx => tx.storeId),
        tids: transactions.map(tx => tx.terminalId),
      });
      console.log(`[pos-sync-service] Receiving ${transactions.length} transactions from client`);

      const result = await this.syncTransactionsFromClientUseCase.execute({ transactions });

      const syncState = await this.getSyncStateUseCase.executeOrNull(req.syncAuth);

      return res.status(200).json({ ...buildSyncTransactionsResponse(result), ...buildPushSyncState(syncState) });
    } catch (error) {
      next(error);
    }
  }
}
