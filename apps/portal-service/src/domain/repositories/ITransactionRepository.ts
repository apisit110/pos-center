import { Transaction, TransactionDetail } from '../../domain/entities/Transaction';

export interface TransactionFilter {
  /** only transactions of this merchant (`transactions.merchant_id` holds the merchant id / mid) */
  merchantMid?: string;
  /** created_at >= startDate */
  startDate?: Date;
  /** created_at <= endDate */
  endDate?: Date;
  transactionId?: string;
  orderId?: string;
  method?: string;
  status?: string;
}

export interface ITransactionRepository {
  /** Ordered by created_at descending, then id descending (newest first). */
  getTransactions(page: number, limit: number, filters?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }>;

  getByUid(uid: string): Promise<TransactionDetail | null>;
}
