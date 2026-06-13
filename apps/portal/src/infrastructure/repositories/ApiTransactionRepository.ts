import { Transaction } from '../../domain/entities/Transaction';
import { TransactionRepository, TransactionFilter } from '../../domain/repositories/TransactionRepository';
import ApiClient from '../api/ApiClient';

export class ApiTransactionRepository implements TransactionRepository {
  public async getTransactions(page: number, limit: number, filters?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }> {
    const params = { page, limit, ...filters };
    const response = await ApiClient.get('/transactions', { params });
    const { transactions, total } = response.data;
    return {
      transactions: transactions.map((t: any) => new Transaction(
        t.id,
        t.uid ?? t.id,
        t.paymentMethod ?? '',
        t.status ?? '',
        t.amount ?? 0,
        t.currency ?? 'THB',
        t.storeName ?? '',
        t.createdAt ? new Date(t.createdAt) : new Date(),
      )),
      total,
    };
  }
}
