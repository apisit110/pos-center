import { Request, Response, NextFunction } from 'express';
import { SyncTransactionsFromClientUseCase } from '../../application/usecases/SyncTransactionsFromClientUseCase';
import { syncTransactionRequestSchema } from '../dtos/request/SyncTransactionRequestDto';
import { buildSyncTransactionsResponse } from '../dtos/response/SyncTransactionsResponseDto';
import { assertTokenScope } from '../middleware/SyncTokenMiddleware';

export class TransactionSyncController {
  constructor(private readonly syncTransactionsFromClientUseCase: SyncTransactionsFromClientUseCase) {}

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

      return res.status(200).json(buildSyncTransactionsResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
