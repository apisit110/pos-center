import { Request, Response, NextFunction } from 'express';
import { SyncTransactionsFromClientUseCase } from '../../application/usecases/SyncTransactionsFromClientUseCase';
import { syncTransactionRequestSchema } from '../dtos/request/SyncTransactionRequestDto';
import { buildSyncTransactionsResponse } from '../dtos/response/SyncTransactionsResponseDto';

export class TransactionSyncController {
  constructor(private readonly syncTransactionsFromClientUseCase: SyncTransactionsFromClientUseCase) {}

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = syncTransactionRequestSchema.parse(req.body);
      console.log(`[pos-sync-service] Receiving ${validatedData.transactions.length} transactions from client`);

      const results = await this.syncTransactionsFromClientUseCase.execute(validatedData.transactions as any);

      return res.status(200).json(buildSyncTransactionsResponse(results));
    } catch (error) {
      next(error);
    }
  }
}
