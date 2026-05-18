import { z } from 'zod';

export const syncTransactionSchema = z.object({
  transactions: z.array(z.object({
    order_id: z.string().min(1),
    merchant_id: z.string().min(1),
    store_id: z.string().min(1),
    terminal_id: z.string().nullable().optional(),
    amount: z.number(),
    payment_method: z.enum(['CASH', 'CREDIT_CARD', 'QR_PROMPTPAY']),
    status: z.enum(['SUCCESS', 'FAILED', 'REFUNDED']),
    staff_name: z.string().min(1),
    created_at: z.string(),
  }).transform(tx => ({
    transactionId: tx.order_id,
    orderId: tx.order_id,
    merchantId: tx.merchant_id,
    storeId: tx.store_id,
    terminalId: tx.terminal_id ?? null,
    amount: tx.amount,
    paymentMethod: tx.payment_method,
    status: tx.status,
    staffName: tx.staff_name,
    createdAt: tx.created_at,
  }))),
});
