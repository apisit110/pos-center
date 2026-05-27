import { db, orders as dbOrders, orderItems as dbOrderItems, orderSyncLogs as dbOrderSyncLogs, merchants, stores, terminals, staff, products, eq, and } from '@pos-center/database';
import { Order, OrderStatus } from '../../domain/entities/Order';
import { OrderRepository, OrderSyncLog } from '../../domain/repositories/OrderRepository';

export class DrizzleOrderRepository implements OrderRepository {
  async save(order: Order): Promise<Order> {
    const [merchant] = await db.select({ id: merchants.id }).from(merchants).where(eq(merchants.mid, order.merchantId));
    if (!merchant) throw new Error(`Merchant not found: ${order.merchantId}`);

    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, order.storeId));
    if (!store) throw new Error(`Store not found: ${order.storeId}`);

    let terminalId: number | null = null;
    if (order.terminalId) {
      const [terminal] = await db.select({ id: terminals.id }).from(terminals).where(eq(terminals.tid, order.terminalId));
      terminalId = terminal?.id ?? null;
    }

    const [staffMember] = await db.select({ id: staff.id }).from(staff).where(eq(staff.username, order.staffId));
    if (!staffMember) throw new Error(`Staff not found: ${order.staffId}`);

    const result = await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(dbOrders).values({
        orderId: order.uid,
        merchantId: merchant.id,
        storeId: store.id,
        terminalId,
        staffId: staffMember.id,
        memberId: order.memberId,
        totalAmount: order.totalAmount.toString(),
        status: order.status as any,
        isSynced: false,
        createdAt: order.createdAt,
      }).returning();

      if (order.items.length > 0) {
        const productIds = await Promise.all(order.items.map(async item => {
          const [product] = await db.select({ id: products.id }).from(products).where(eq(products.uid, item.productId));
          if (!product) throw new Error(`Product not found: ${item.productId}`);
          return product.id;
        }));

        await tx.insert(dbOrderItems).values(order.items.map((item, i) => ({
          orderId: newOrder.id,
          productId: productIds[i],
          quantity: item.quantity,
          price: item.price.toString(),
        })));
      }

      return newOrder;
    });

    return new Order(
      result.id.toString(),
      result.orderId,
      order.merchantId,
      order.storeId,
      order.terminalId,
      order.staffId,
      order.memberId,
      order.items,
      Number(result.totalAmount),
      result.status as OrderStatus,
      result.isSynced,
      result.createdAt,
    );
  }

  async findSyncLogByOrderId(orderId: string, storeSid: string): Promise<OrderSyncLog | null> {
    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, storeSid));
    if (!store) return null;

    const [log] = await db.select()
      .from(dbOrderSyncLogs)
      .where(
        and(
          eq(dbOrderSyncLogs.posTempId, orderId),
          eq(dbOrderSyncLogs.storeId, store.id)
        )
      );

    if (!log) return null;

    return {
      orderId: log.posTempId,
      storeId: storeSid,
      globalOrderId: log.globalOrderId.toString(),
    };
  }

  async createSyncLog(log: OrderSyncLog): Promise<void> {
    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, log.storeId));
    if (!store) throw new Error(`Store not found: ${log.storeId}`);

    await db.insert(dbOrderSyncLogs).values({
      posTempId: log.orderId,
      storeId: store.id,
      globalOrderId: parseInt(log.globalOrderId),
    });
  }
}
