import { db, transactions as dbTransactions, orders as dbOrders, merchants, stores, terminals, eq, and } from '@pos-center/database';
import { Transaction } from '../../domain/entities/Transaction';
import { TransactionRepository } from '../../domain/repositories/TransactionRepository';

type DbPaymentMethod = NonNullable<typeof dbTransactions.$inferInsert['paymentMethod']>;
type DbTransactionStatus = NonNullable<typeof dbTransactions.$inferInsert['status']>;

// client payment method -> center payment method, CREDIT_CARD is not supported by the center yet
const PAYMENT_METHOD_MAP: Record<string, DbPaymentMethod> = {
  CASH: 'CASH',
  QR_PROMPTPAY: 'QR',
};

// client status -> center status
const STATUS_MAP: Record<string, DbTransactionStatus> = {
  SUCCESS: 'APPROVED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export class DrizzleTransactionRepository implements TransactionRepository {
  async save(transaction: Transaction, storeSid: string): Promise<Transaction> {
    const paymentMethod = PAYMENT_METHOD_MAP[transaction.paymentMethod];
    if (!paymentMethod) throw new Error(`Payment method not supported: ${transaction.paymentMethod}`);

    const status = STATUS_MAP[transaction.status];
    if (!status) throw new Error(`Transaction status not supported: ${transaction.status}`);

    const [merchant] = await db.select({ id: merchants.id }).from(merchants).where(eq(merchants.partnerId, transaction.merchantId));
    if (!merchant) throw new Error(`Merchant not found: ${transaction.merchantId}`);

    const [store] = await db.select({ id: stores.id }).from(stores)
      .where(and(eq(stores.sid, storeSid), eq(stores.merchantId, merchant.id)));
    if (!store) throw new Error(`Store not found: ${storeSid}`);

    const [order] = await db.select({ orderId: dbOrders.orderId })
      .from(dbOrders)
      .where(
        and(
          eq(dbOrders.orderId, transaction.orderId),
          eq(dbOrders.storeId, store.id)
        )
      );

    if (!order) {
      throw new Error(`Order not found for local order ID: ${transaction.orderId} in store: ${storeSid}. Sync order first.`);
    }

    let terminalId: number | null = null;
    if (transaction.terminalId) {
      const [terminal] = await db.select({ id: terminals.id }).from(terminals).where(eq(terminals.tid, transaction.terminalId));
      terminalId = terminal?.id ?? null;
    }

    const [newTx] = await db.insert(dbTransactions).values({
      uid: transaction.uid,
      orderId: order.orderId,
      merchantId: merchant.id,
      storeId: store.id,
      terminalId,
      amount: transaction.amount.toString(),
      paymentMethod,
      status,
      staffName: transaction.staffName,
      createdAt: transaction.createdAt,
    }).returning();

    return new Transaction(
      newTx.id.toString(),
      newTx.uid,
      transaction.orderId,
      transaction.merchantId,
      transaction.terminalId,
      Number(newTx.amount),
      transaction.paymentMethod,
      transaction.status,
      transaction.staffName,
      newTx.createdAt
    );
  }

  async findByUid(uid: string): Promise<{ id: string } | null> {
    const [tx] = await db.select({ id: dbTransactions.id })
      .from(dbTransactions)
      .where(eq(dbTransactions.uid, uid));

    if (!tx) return null;
    return { id: tx.id.toString() };
  }
}
