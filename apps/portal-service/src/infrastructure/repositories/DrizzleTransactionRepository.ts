import { db, transactions, stores, terminals, merchants, orders, orderItems, products } from '@pos-center/database';
import { eq, and, like, gte, lte, count, desc, inArray, SQL } from 'drizzle-orm';
import { merchantUidIs } from '../utils/merchant';
import { Transaction, TransactionDetail, TransactionItem } from '../../domain/entities/Transaction';
import { ITransactionRepository, TransactionFilter } from '../../domain/repositories/ITransactionRepository';

export class DrizzleTransactionRepository implements ITransactionRepository {
  async getTransactions(page: number, limit: number, filters?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions: SQL[] = [];

    if (filters?.merchantUid) {
      // transactions.merchant_id is a logical reference (no FK) to merchant.id
      conditions.push(inArray(
        transactions.merchantId,
        db.select({ id: merchants.id }).from(merchants).where(merchantUidIs(filters.merchantUid)),
      ));
    }

    if (filters?.transactionId) {
      conditions.push(like(transactions.uid, `%${filters.transactionId}%`));
    }

    if (filters?.orderId) {
      conditions.push(like(orders.orderId, `%${filters.orderId}%`));
    }

    if (filters?.method) {
      conditions.push(eq(transactions.paymentMethod, filters.method as any));
    }

    if (filters?.status) {
      conditions.push(eq(transactions.status, filters.status as any));
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
        storeNameEn: stores.nameEn,
        storeNameTh: stores.nameTh,
        staffName: transactions.staffName,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(orders, eq(transactions.orderId, orders.orderId))
      .leftJoin(stores, eq(transactions.storeId, stores.id))
      .where(whereClause)
      .orderBy(desc(transactions.createdAt), desc(transactions.id))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ value: count() })
      .from(transactions)
      .leftJoin(orders, eq(transactions.orderId, orders.orderId))
      .leftJoin(stores, eq(transactions.storeId, stores.id))
      .where(whereClause);

    return {
      transactions: results.map(t => new Transaction(
        t.id.toString(),
        t.uid,
        t.paymentMethod ?? '',
        t.status ?? '',
        Number(t.amount ?? 0),
        'THB',
        t.storeNameEn ?? '',
        t.storeNameTh ?? '',
        t.staffName ?? '',
        t.createdAt,
        t.orderId ?? '',
      )),
      total: Number(totalCount[0].value),
    };
  }

  async getByUid(uid: string): Promise<TransactionDetail | null> {
    const [row] = await db
      .select({
        id: transactions.id,
        uid: transactions.uid,
        orderPk: orders.id,
        orderId: orders.orderId,
        orderStatus: orders.status,
        orderTotalAmount: orders.totalAmount,
        merchantUid: merchants.uid,
        partnerId: merchants.partnerId,
        tid: terminals.tid,
        staffName: transactions.staffName,
        paymentMethod: transactions.paymentMethod,
        status: transactions.status,
        amount: transactions.amount,
        storeNameEn: stores.nameEn,
        storeNameTh: stores.nameTh,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(orders, eq(transactions.orderId, orders.orderId))
      .leftJoin(stores, eq(transactions.storeId, stores.id))
      .leftJoin(terminals, eq(transactions.terminalId, terminals.id))
      .leftJoin(merchants, eq(transactions.merchantId, merchants.id))
      .where(eq(transactions.uid, uid))
      .limit(1);

    if (!row) return null;

    const items = row.orderPk === null ? [] : await db
      .select({
        productUid: products.uid,
        nameEn: products.nameEn,
        nameTh: products.nameTh,
        sku: products.sku,
        barcode: products.barcode,
        quantity: orderItems.quantity,
        price: orderItems.price,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, row.orderPk))
      .orderBy(orderItems.id);

    return new TransactionDetail(
      new Transaction(
        row.id.toString(),
        row.uid,
        row.paymentMethod ?? '',
        row.status ?? '',
        Number(row.amount ?? 0),
        'THB',
        row.storeNameEn ?? '',
        row.storeNameTh ?? '',
        row.staffName ?? '',
        row.createdAt,
        row.orderId ?? '',
      ),
      row.merchantUid ?? '',
      row.partnerId ?? '',
      row.tid ?? '',
      row.orderStatus ?? '',
      Number(row.orderTotalAmount ?? 0),
      items.map(i => new TransactionItem(
        i.productUid ?? '',
        i.nameEn ?? '',
        i.nameTh ?? '',
        i.sku ?? '',
        i.barcode ?? '',
        i.quantity,
        Number(i.price),
      )),
    );
  }
}
