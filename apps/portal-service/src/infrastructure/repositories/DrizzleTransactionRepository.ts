import { db, transactions, stores, orders } from '@pos-center/database';
import { eq, and, like, gte, lte, count, desc, SQL } from 'drizzle-orm';
import { Transaction } from '../../domain/entities/Transaction';
import { ITransactionRepository, TransactionFilter } from '../../domain/repositories/ITransactionRepository';

export class DrizzleTransactionRepository implements ITransactionRepository {
  async getTransactions(page: number, limit: number, filters?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions: SQL[] = [];

    if (filters?.merchantMid) {
      conditions.push(eq(transactions.merchantId, filters.merchantMid));
    }

    if (filters?.transactionId) {
      conditions.push(like(transactions.uid, `%${filters.transactionId}%`));
    }

    if (filters?.orderId) {
      conditions.push(like(orders.orderId, `%${filters.orderId}%`));
    }

    if (filters?.method) {
      conditions.push(eq(transactions.paymentMethod, filters.method));
    }

    if (filters?.status) {
      conditions.push(eq(transactions.status, filters.status));
    }

    if (filters?.startDate) {
      conditions.push(gte(transactions.createdAt, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(transactions.createdAt, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select({
        id: transactions.id,
        uid: transactions.uid,
        orderId: orders.orderId,
        paymentMethod: transactions.paymentMethod,
        status: transactions.status,
        amount: transactions.amount,
        storeName: stores.name,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(orders, eq(transactions.orderId, orders.id))
      .leftJoin(stores, eq(transactions.storeId, stores.id))
      .where(whereClause)
      .orderBy(desc(transactions.createdAt), desc(transactions.id))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ value: count() })
      .from(transactions)
      .leftJoin(orders, eq(transactions.orderId, orders.id))
      .leftJoin(stores, eq(transactions.storeId, stores.id))
      .where(whereClause);

    return {
      transactions: results.map(t => new Transaction(
        t.id.toString(),
        t.uid,
        t.paymentMethod,
        t.status,
        Number(t.amount),
        'THB',
        t.storeName ?? '',
        t.createdAt ?? new Date(),
        t.orderId?.toString() ?? '',
      )),
      total: Number(totalCount[0].value),
    };
  }
}
