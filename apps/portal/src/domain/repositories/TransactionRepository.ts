import { Transaction, TransactionDetail } from '../../domain/entities/Transaction';

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  transactionId?: string;
  orderId?: string;
  method?: string;
  status?: string;
  merchantId?: string;
  storeId?: string;
}

export interface TransactionRepository {
  getTransactions(page: number, limit: number, filters?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }>;
  getTransactionById(id: string): Promise<TransactionDetail>;
}
