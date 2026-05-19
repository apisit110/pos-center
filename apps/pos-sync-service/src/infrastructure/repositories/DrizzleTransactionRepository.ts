import { db, transactions as dbTransactions, orders as dbOrders, stores, eq, and } from '@lightning/database';
import { Transaction } from '../../domain/entities/Transaction';
import { TransactionRepository } from '../../domain/repositories/TransactionRepository';

export class DrizzleTransactionRepository implements TransactionRepository {
  async save(transaction: Transaction, storeSid: string): Promise<Transaction> {
    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, storeSid));
    if (!store) throw new Error(`Store not found: ${storeSid}`);

    const [order] = await db.select({ id: dbOrders.id })
      .from(dbOrders)
      .where(
        and(
          eq(dbOrders.orderId, transaction.orderId),
          eq(dbOrders.storeId, store.id)
        )
      );

    console.log({
      transaction: transaction.orderId,
      store: store.id
    });

    if (!order) {
      throw new Error(`Order not found for local order ID: ${transaction.orderId} in store: ${storeSid}. Sync order first.`);
    }

    const [newTx] = await db.insert(dbTransactions).values({
      uid: transaction.uid,
      orderId: order.id,
      merchantId: transaction.merchantId,
      storeId: store.id,
      terminalId: transaction.terminalId,
      amount: transaction.amount.toString(),
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      staffName: transaction.staffName,
      createdAt: transaction.createdAt,
    }).returning();

    return new Transaction(
      newTx.id.toString(),
      newTx.uid,
      transaction.orderId,
      newTx.merchantId,
      newTx.terminalId ?? null,
      Number(newTx.amount),
      newTx.paymentMethod,
      newTx.status,
      newTx.staffName,
      newTx.createdAt || transaction.createdAt
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
