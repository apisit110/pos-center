import { z } from 'zod';

export const syncTransactionRequestSchema = z.object({
  transactions: z.array(z.object({
    id: z.string().min(1),
    order_id: z.string().min(1),
    merchant_id: z.string().min(1),
    store_id: z.string().min(1),
    terminal_id: z.string().nullable().optional(),
    amount: z.number(),
    received_amount: z.number().min(0).nullable().optional(),
    change_amount: z.number().min(0).nullable().optional(),
    payment_method: z.enum(['CASH', 'QR_PROMPTPAY']),
    status: z.enum(['PENDING', 'APPROVED', 'FAILED', 'VOIDED', 'REFUNDED']),
    staff_name: z.string().min(1),
    created_at: z.string(),
  }).transform(tx => ({
    id: tx.id,
    transactionId: tx.order_id,
    orderId: tx.order_id,
    merchantId: tx.merchant_id,
    storeId: tx.store_id,
    terminalId: tx.terminal_id ?? null,
    amount: tx.amount,
    receivedAmount: tx.received_amount ?? null,
    changeAmount: tx.change_amount ?? null,
    paymentMethod: tx.payment_method,
    status: tx.status,
    staffName: tx.staff_name,
    createdAt: tx.created_at,
  }))),
});

export type SyncTransactionRequestDto = z.infer<typeof syncTransactionRequestSchema>;
