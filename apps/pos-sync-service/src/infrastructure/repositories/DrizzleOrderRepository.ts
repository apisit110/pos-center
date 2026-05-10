import { db, orders as dbOrders, orderItems as dbOrderItems, orderSyncLogs as dbOrderSyncLogs, merchants, stores, terminals, staff, eq, and } from '@lightning/database';
import { Order, OrderItem, OrderStatus } from '../../domain/entities/Order';
import { OrderRepository, OrderSyncLog } from '../../domain/repositories/OrderRepository';
import { v4 as uuidv4 } from 'uuid';

export class DrizzleOrderRepository implements OrderRepository {
  async save(order: Order): Promise<Order> {
    const orderUid = order.uid || uuidv4();
    
    // Look up internal IDs
    const [merchant] = await db.select({ id: merchants.id }).from(merchants).where(eq(merchants.mid, order.merchantId));
    if (!merchant) throw new Error(`Merchant not found: ${order.merchantId}`);

    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, order.storeId));
    if (!store) throw new Error(`Store not found: ${order.storeId}`);

    let terminalId: number | null = null;
    if (order.terminalId) {
      const [terminal] = await db.select({ id: terminals.id }).from(terminals).where(eq(terminals.tid, order.terminalId));
      terminalId = terminal?.id || null;
    }

    let staffId: number | null = null;
    if (order.staffId) {
      const [staffMember] = await db.select({ id: staff.id }).from(staff).where(eq(staff.uid, order.staffId));
      staffId = staffMember?.id || null;
    }

    const result = await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(dbOrders).values({
        uid: orderUid,
        orderNumber: order.orderNumber,
        merchantId: merchant.id,
        storeId: store.id,
        terminalId: terminalId,
        staffId: staffId,
        totalAmount: order.totalAmount.toString(),
        status: order.status as any,
      }).returning();

      if (order.items.length > 0) {
        await tx.insert(dbOrderItems).values(order.items.map(item => {
          const isNumericId = item.productId ? /^\d+$/.test(item.productId) : false;
          const productId = isNumericId ? parseInt(item.productId!) : null;
          // If productId is not numeric, it's likely a UID
          const productUid = item.productUid || (!isNumericId ? item.productId : null);

          return {
            orderId: newOrder.id,
            productId: productId,
            productUid: productUid,
            name: item.name,
            quantity: item.quantity,
            price: item.price.toString(),
            subtotal: item.subtotal.toString(),
          };
        }));
      }

      return newOrder;
    });

    return new Order(
      result.id.toString(),
      result.uid,
      result.orderNumber,
      order.merchantId,
      order.storeId,
      order.terminalId,
      order.staffId,
      order.items,
      Number(result.totalAmount),
      result.status as OrderStatus,
      result.createdAt || undefined,
      result.updatedAt || undefined
    );
  }

  async findSyncLogByPosTempId(posTempId: string, storeSid: string): Promise<OrderSyncLog | null> {
    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, storeSid));
    if (!store) return null;

    const [log] = await db.select()
      .from(dbOrderSyncLogs)
      .where(
        and(
          eq(dbOrderSyncLogs.posTempId, posTempId),
          eq(dbOrderSyncLogs.storeId, store.id)
        )
      );
    
    if (!log) return null;
    
    return {
      posTempId: log.posTempId,
      storeId: storeSid,
      globalOrderId: log.globalOrderId.toString(),
    };
  }

  async createSyncLog(log: OrderSyncLog): Promise<void> {
    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, log.storeId));
    if (!store) throw new Error(`Store not found: ${log.storeId}`);

    await db.insert(dbOrderSyncLogs).values({
      posTempId: log.posTempId,
      storeId: store.id,
      globalOrderId: parseInt(log.globalOrderId),
    });
  }
}
