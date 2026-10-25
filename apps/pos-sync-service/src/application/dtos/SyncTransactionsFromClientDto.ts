export interface SyncTransactionRequest {
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

export interface SyncTransactionResult {
  transactionId: string;
  globalTransactionId: string;
  status: 'synced' | 'already_synced' | 'error';
}

export interface SyncTransactionsFromClientRequest {
  transactions: SyncTransactionRequest[];
}

export interface SyncTransactionsFromClientResponse {
  /** same order as request */
  results: SyncTransactionResult[];
}
