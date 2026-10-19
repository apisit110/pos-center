import { Transaction } from '../../domain/entities/Transaction';
import { TransactionRepository, TransactionFilter } from '../../domain/repositories/TransactionRepository';
import ApiClient, { API_V1, cleanParams, unwrap } from '../api/ApiClient';

interface TransactionResponse {
  uid: string;
  order_id: string;
  payment_method: string;
  status: string;
  amount: number;
  currency: string;
  store_name: string;
  created_at: string;
}

// API enums (`CASH|QR`, `PENDING|APPROVED|FAILED|VOIDED|REFUNDED`) <-> domain values (same words, lower case)
const toApiEnum = (value?: string) => (value ? value.toUpperCase() : undefined);

const fromApiEnum = (value?: string) => (value ? value.toLowerCase() : '');

export class ApiTransactionRepository implements TransactionRepository {
  public async getTransactions(page: number, limit: number, filters?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }> {
    const params = cleanParams({
      page,
      limit,
      transaction_id: filters?.transactionId,
      order_id: filters?.orderId,
      method: toApiEnum(filters?.method),
      status: toApiEnum(filters?.status),
      start_date: filters?.startDate,
      end_date: filters?.endDate,
    });
    const response = await ApiClient.get(`${API_V1}/transactions`, { params });
    const { items, total } = unwrap<{ items: TransactionResponse[]; total: number }>(response);
    return {
      transactions: items.map((t) => new Transaction(
        t.uid,
        t.uid,
        fromApiEnum(t.payment_method),
        fromApiEnum(t.status),
        Number(t.amount ?? 0),
        t.currency ?? 'THB',
        t.store_name ?? '',
        t.created_at ? new Date(t.created_at) : new Date(),
        t.order_id ?? '',
      )),
      total,
    };
  }
}
