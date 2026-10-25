export interface SyncTransactionRequest {
  id: string;
  transactionId: string; // order_id used as idempotency key
  orderId: string;
  merchantId: string;
  storeId: string;
  terminalId: string | null;
  amount: number;
  receivedAmount: number | null;
  changeAmount: number | null;
  paymentMethod: 'CASH' | 'QR_PROMPTPAY';
  status: 'PENDING' | 'APPROVED' | 'FAILED' | 'VOIDED' | 'REFUNDED';
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
