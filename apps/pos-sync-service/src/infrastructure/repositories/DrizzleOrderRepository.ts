import { db, orders as dbOrders, orderItems as dbOrderItems, orderSyncLogs as dbOrderSyncLogs, merchants, stores, terminals, cashierStaff, members, products, eq, and } from '@pos-center/database';
import { Order, OrderStatus } from '../../domain/entities/Order';
import { IOrderRepository, OrderSyncLog } from '../../domain/repositories/IOrderRepository';

type DbOrderStatus = typeof dbOrders.$inferInsert['status'];

// client sends CANCELLED, center stores it as VOID
const toDbOrderStatus = (status: OrderStatus): DbOrderStatus =>
  status === OrderStatus.CANCELLED ? 'VOID' : status;

export class DrizzleOrderRepository implements IOrderRepository {
  async save(order: Order): Promise<Order> {
    const [merchant] = await db.select({ id: merchants.id }).from(merchants).where(eq(merchants.partnerId, order.merchantId));
    if (!merchant) throw new Error(`Merchant not found: ${order.merchantId}`);

    const [store] = await db.select({ id: stores.id }).from(stores)
      .where(and(eq(stores.sid, order.storeId), eq(stores.merchantId, merchant.id)));
    if (!store) throw new Error(`Store not found: ${order.storeId}`);

    if (!order.terminalId) throw new Error('Terminal is required');
    const [terminal] = await db.select({ id: terminals.id }).from(terminals).where(eq(terminals.tid, order.terminalId));
    if (!terminal) throw new Error(`Terminal not found: ${order.terminalId}`);

    const [staffMember] = await db.select({ id: cashierStaff.id }).from(cashierStaff)
      .where(and(eq(cashierStaff.username, order.staffId), eq(cashierStaff.merchantId, merchant.id)));
    if (!staffMember) throw new Error(`Staff not found: ${order.staffId}`);

    let memberId: number | null = null;
    if (order.memberId) {
      const [member] = await db.select({ id: members.id }).from(members).where(eq(members.phoneNo, order.memberId));
      memberId = member?.id ?? null;
    }

    const result = await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(dbOrders).values({
        orderId: order.uid,
        merchantId: merchant.id,
        storeId: store.id,
        terminalId: terminal.id,
        cashierStaffId: staffMember.id,
        memberId,
        totalAmount: order.totalAmount.toString(),
        status: toDbOrderStatus(order.status),
        isSynced: false,
        createdAt: order.createdAt,
      }).returning();

      if (order.items.length > 0) {
        const productIds = await Promise.all(order.items.map(async item => {
          const [product] = await tx.select({ id: products.id }).from(products).where(eq(products.uid, item.productId));
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
      order.status,
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
      orderId,
      storeId: storeSid,
      globalOrderId: log.globalOrderId ?? '',
    };
  }

  async createSyncLog(log: OrderSyncLog): Promise<void> {
    const [store] = await db.select({ id: stores.id }).from(stores).where(eq(stores.sid, log.storeId));
    if (!store) throw new Error(`Store not found: ${log.storeId}`);

    await db.insert(dbOrderSyncLogs).values({
      posTempId: log.orderId,
      storeId: store.id,
      globalOrderId: log.globalOrderId,
      syncedAt: new Date(),
    });
  }
}
