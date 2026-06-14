import { TransactionRepository } from '../repositories/TransactionRepository';
import { Transaction } from '../entities/Transaction';

export interface SyncTransactionDTO {
  id: string;
  transactionId: string; // order_id used as idempotency key
  orderId: string;
  merchantId: string;
  storeId: string;
  terminalId: string | null;
  amount: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'QR_PROMPTPAY';
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  staffName: string;
  createdAt: string;
}

export interface SyncTransactionResponseDTO {
  transactionId: string;
  globalTransactionId: string;
  status: 'synced' | 'already_synced' | 'error';
}

export class SyncTransactionsFromClientUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(transactionsToSync: SyncTransactionDTO[]): Promise<SyncTransactionResponseDTO[]> {
    const results: SyncTransactionResponseDTO[] = [];

    for (const txData of transactionsToSync) {
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

    return results;
  }
}
