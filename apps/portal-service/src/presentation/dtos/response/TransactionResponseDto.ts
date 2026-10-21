import { Transaction, TransactionDetail } from '../../../domain/entities/Transaction';

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

export interface TransactionItemResponseDto {
  product_uid: string;
  name: string;
  sku: string;
  barcode: string;
  quantity: number;
  price: number;
  total: number;
}

export interface TransactionDetailResponseDto extends TransactionResponseDto {
  mid: string;
  terminal_id: string;
  staff_name: string;
  order_status: string;
  order_total_amount: number;
  items: TransactionItemResponseDto[];
}

export function toTransactionDetailResponseDto(detail: TransactionDetail): TransactionDetailResponseDto {
  return {
    ...toTransactionResponseDto(detail.transaction),
    mid: detail.merchantMid,
    terminal_id: detail.terminalId,
    staff_name: detail.staffName,
    order_status: detail.orderStatus,
    order_total_amount: detail.orderTotalAmount,
    items: detail.items.map(i => ({
      product_uid: i.productUid,
      name: i.name,
      sku: i.sku,
      barcode: i.barcode,
      quantity: i.quantity,
      price: i.price,
      total: Math.round(i.price * i.quantity * 100) / 100,
    })),
  };
}
