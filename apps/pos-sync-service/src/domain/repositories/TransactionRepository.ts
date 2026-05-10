import { Transaction } from '../entities/Transaction';

export interface TransactionSyncLog {
  posTempId: string;
  storeId: string;
  globalTransactionId: string;
}

export interface TransactionRepository {
  save(transaction: Transaction, storeSid: string): Promise<Transaction>;
  findSyncLogByPosTempId(posTempId: string, storeSid: string): Promise<TransactionSyncLog | null>;
  createSyncLog(log: TransactionSyncLog): Promise<void>;
}
