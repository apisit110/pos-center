import { Transaction } from '../../../domain/entities/Transaction';

export interface TransactionResponseDto {
  uid: string;
  order_id: string;
  payment_method: string;
  status: string;
  amount: number;
  currency: string;
  store_name: string;
  created_at: string;
}

export function toTransactionResponseDto(transaction: Transaction): TransactionResponseDto {
  return {
    uid: transaction.uid,
    order_id: transaction.orderId,
    payment_method: transaction.paymentMethod,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    store_name: transaction.storeName,
    created_at: transaction.createdAt.toISOString(),
  };
}
