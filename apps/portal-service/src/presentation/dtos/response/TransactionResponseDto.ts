import { Transaction } from '../../../domain/entities/Transaction';

export interface TransactionResponseDto {
  id: string;
  uid: string;
  paymentMethod: string;
  status: string;
  amount: number;
  currency: string;
  storeName: string;
  createdAt: Date;
  orderId: string;
}

export function toTransactionResponseDto(transaction: Transaction): TransactionResponseDto {
  return {
    id: transaction.id,
    uid: transaction.uid,
    paymentMethod: transaction.paymentMethod,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    storeName: transaction.storeName,
    createdAt: transaction.createdAt,
    orderId: transaction.orderId,
  };
}
