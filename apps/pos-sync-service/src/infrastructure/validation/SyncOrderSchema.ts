import { z } from 'zod';

export const syncOrderSchema = z.object({
  orders: z.array(z.object({
    order_id: z.string().min(1),
    merchant_id: z.string().min(1),
    store_id: z.string().min(1),
    terminal_id: z.string().nullable().optional(),
    staff_id: z.string().min(1),
    member_id: z.string().nullable().optional(),
    total_amount: z.number(),
    status: z.enum(['PENDING', 'PAID', 'CANCELLED']),
    items: z.array(z.object({
      product_id: z.string().min(1),
      quantity: z.number().int(),
      price: z.number(),
    })),
    created_at: z.string(),
  }).transform(order => ({
    orderId: order.order_id,
    merchantId: order.merchant_id,
    storeId: order.store_id,
    terminalId: order.terminal_id ?? null,
    staffId: order.staff_id,
    memberId: order.member_id ?? null,
    totalAmount: order.total_amount,
    status: order.status,
    items: order.items.map(item => ({
      productId: item.product_id,
      quantity: item.quantity,
      price: item.price,
    })),
    createdAt: order.created_at,
  }))),
});
