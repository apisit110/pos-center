import { db, transactions as dbTransactions, transactionSyncLogs as dbTransactionSyncLogs, orderSyncLogs as dbOrderSyncLogs, stores, eq, and } from '@lightning/database';
import { Transaction } from '../../domain/entities/Transaction';
import { TransactionRepository, TransactionSyncLog } from '../../domain/repositories/TransactionRepository';

export class DrizzleTransactionRepository implements TransactionRepository {
  async save(transaction: Transaction, storeSid: string): Promise<Transaction> {
    // 1. Look up the global order ID using the local order ID (orderId) and store ID
    // We look into orderSyncLogs to find which global order this local order refers to.
    
    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, storeSid));
    if (!store) throw new Error(`Store not found: ${storeSid}`);

    const [orderLog] = await db.select({ globalOrderId: dbOrderSyncLogs.globalOrderId })
      .from(dbOrderSyncLogs)
      .where(
        and(
          eq(dbOrderSyncLogs.posTempId, transaction.orderId),
          eq(dbOrderSyncLogs.storeId, store.id)
        )
      );

    if (!orderLog) {
      throw new Error(`Global order not found for local order ID: ${transaction.orderId} in store: ${storeSid}. Sync order first.`);
    }

    const [newTx] = await db.insert(dbTransactions).values({
      uid: transaction.uid,
      orderId: orderLog.globalOrderId,
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
      Number(newTx.amount),
      newTx.paymentMethod,
      newTx.status,
      newTx.staffName || '',
      newTx.createdAt || transaction.createdAt
    );
  }

  async findSyncLogByPosTempId(posTempId: string, storeSid: string): Promise<TransactionSyncLog | null> {
    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, storeSid));
    if (!store) return null;

    const [log] = await db.select()
      .from(dbTransactionSyncLogs)
      .where(
        and(
          eq(dbTransactionSyncLogs.posTempId, posTempId),
          eq(dbTransactionSyncLogs.storeId, store.id)
        )
      );
    
    if (!log) return null;
    
    return {
      posTempId: log.posTempId,
      storeId: storeSid,
      globalTransactionId: log.globalTransactionId.toString(),
    };
  }

  async createSyncLog(log: TransactionSyncLog): Promise<void> {
    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, log.storeId));
    if (!store) throw new Error(`Store not found: ${log.storeId}`);

    await db.insert(dbTransactionSyncLogs).values({
      posTempId: log.posTempId,
      storeId: store.id,
      globalTransactionId: parseInt(log.globalTransactionId),
    });
  }
}
