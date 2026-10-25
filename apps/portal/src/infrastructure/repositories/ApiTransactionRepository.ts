import { Transaction, TransactionDetail, TransactionItem } from '../../domain/entities/Transaction';
import { TransactionRepository, TransactionFilter } from '../../domain/repositories/TransactionRepository';
import ApiClient, { API_V1, cleanParams, unwrap } from '../api/ApiClient';

interface TransactionResponse {
  uid: string;
  order_id: string;
  payment_method: string;
  status: string;
  amount: number;
  currency: string;
  store_name_en: string;
  store_name_th: string;
  staff_name: string;
  created_at: string;
}

interface TransactionItemResponse {
  product_uid: string;
  name_en: string;
  name_th: string;
  sku: string;
  barcode: string;
  quantity: number;
  price: number;
  total: number;
}

interface TransactionDetailResponse extends TransactionResponse {
  partner_id: string;
  terminal_id: string;
  order_status: string;
  order_total_amount: number;
  items: TransactionItemResponse[];
}

// API enums (`CASH|QR`, `PENDING|APPROVED|FAILED|VOIDED|REFUNDED`) <-> domain values (same words, lower case)
const toApiEnum = (value?: string) => (value ? value.toUpperCase() : undefined);

const fromApiEnum = (value?: string) => (value ? value.toLowerCase() : '');

const toTransaction = (t: TransactionResponse): Transaction => new Transaction(
  t.uid,
  t.uid,
  fromApiEnum(t.payment_method),
  fromApiEnum(t.status),
  Number(t.amount ?? 0),
  t.currency ?? 'THB',
  t.store_name_en ?? '',
  t.store_name_th ?? '',
  t.staff_name ?? '',
  t.created_at ? new Date(t.created_at) : new Date(),
  t.order_id ?? '',
);

export class ApiTransactionRepository implements TransactionRepository {
  public async getTransactions(page: number, limit: number, filters?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }> {
    const params = cleanParams({
      page,
      limit,
      transaction_id: filters?.transactionId,
      order_id: filters?.orderId,
      method: toApiEnum(filters?.method),
      status: toApiEnum(filters?.status),
      merchant_uid: filters?.merchantId,
      store_uid: filters?.storeId,
      start_date: filters?.startDate,
      end_date: filters?.endDate,
    });
    const response = await ApiClient.get(`${API_V1}/transactions`, { params });
    const { items, total } = unwrap<{ items: TransactionResponse[]; total: number }>(response);
    return {
      transactions: items.map(toTransaction),
      total,
    };
  }

  public async getTransactionById(id: string): Promise<TransactionDetail> {
    const response = await ApiClient.get(`${API_V1}/transactions/${encodeURIComponent(id)}`);
    const t = unwrap<TransactionDetailResponse>(response);
    return new TransactionDetail(
      toTransaction(t),
      t.partner_id ?? '',
      t.terminal_id ?? '',
      fromApiEnum(t.order_status),
      Number(t.order_total_amount ?? 0),
      (t.items ?? []).map((i) => new TransactionItem(
        i.product_uid,
        i.name_en ?? '',
        i.name_th ?? '',
        i.sku ?? '',
        i.barcode ?? '',
        Number(i.quantity),
        Number(i.price),
        Number(i.total),
      )),
    );
  }
}
