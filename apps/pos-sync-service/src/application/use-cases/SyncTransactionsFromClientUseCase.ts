import { TransactionRepository } from '../../domain/repositories/TransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';

export interface SyncTransactionDTO {
  posTempId: string;
  orderId: string; // Local Order ID from POS
  amount: number;
  paymentMethod: string;
  status: string;
  staffName: string;
  createdAt: string;
  storeId: string;
}

export interface SyncTransactionResponseDTO {
  posTempId: string;
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
        const existingLog = await this.transactionRepository.findSyncLogByPosTempId(txData.posTempId, txData.storeId);
        if (existingLog) {
          results.push({
            posTempId: txData.posTempId,
            globalTransactionId: existingLog.globalTransactionId,
            status: 'already_synced',
          });
          continue;
        }

        // 2. Create transaction entity
        const transaction = new Transaction(
          '', // ID assigned by repo
          txData.posTempId, // Using POS ID as global UID
          txData.orderId,
          txData.amount,
          txData.paymentMethod,
          txData.status,
          txData.staffName,
          new Date(txData.createdAt)
        );

        // 3. Save transaction
        const savedTx = await this.transactionRepository.save(transaction, txData.storeId);

        // 4. Create sync log
        await this.transactionRepository.createSyncLog({
          posTempId: txData.posTempId,
          storeId: txData.storeId,
          globalTransactionId: savedTx.id,
        });

        results.push({
          posTempId: txData.posTempId,
          globalTransactionId: savedTx.id,
          status: 'synced',
        });
      } catch (error) {
        console.error(`Error syncing transaction ${txData.posTempId}:`, error);
        results.push({
          posTempId: txData.posTempId,
          globalTransactionId: '',
          status: 'error',
        });
      }
    }

    return results;
  }
}
