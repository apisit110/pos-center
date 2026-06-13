import { Transaction } from '../../domain/entities/Transaction';

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  transactionId?: string;
  method?: string;
  status?: string;
}

export interface TransactionRepository {
  getTransactions(page: number, limit: number, filters?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }>;
}
