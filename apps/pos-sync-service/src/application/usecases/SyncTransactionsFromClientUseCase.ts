import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';
import { SyncTransactionResult, SyncTransactionsFromClientRequest, SyncTransactionsFromClientResponse } from '../dtos/SyncTransactionsFromClientDto';

export class SyncTransactionsFromClientUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute({ transactions }: SyncTransactionsFromClientRequest): Promise<SyncTransactionsFromClientResponse> {
    const results: SyncTransactionResult[] = [];

    for (const txData of transactions) {
      try {
        // 1. Check idempotency
        const existing = await this.transactionRepository.findByUid(txData.transactionId);
        if (existing) {
          results.push({
            transactionId: txData.transactionId,
            globalTransactionId: existing.id,
            status: 'already_synced',
          });
          continue;
        }

        // 2. Create transaction entity
        const transaction = new Transaction(
          txData.id,
          txData.transactionId,
          txData.orderId,
          txData.merchantId,
          txData.terminalId ?? null,
          txData.amount,
          txData.receivedAmount,
          txData.changeAmount,
          txData.paymentMethod,
          txData.status,
          txData.staffName,
          new Date(txData.createdAt)
        );

        // 3. Save transaction
        const savedTx = await this.transactionRepository.save(transaction, txData.storeId);

        results.push({
          transactionId: txData.transactionId,
          globalTransactionId: savedTx.id,
          status: 'synced',
        });
      } catch (error) {
        console.error(`Error syncing transaction ${txData.transactionId}:`, error);
        results.push({
          transactionId: txData.transactionId,
          globalTransactionId: '',
          status: 'error',
        });
      }
    }

    return { results };
  }
}
