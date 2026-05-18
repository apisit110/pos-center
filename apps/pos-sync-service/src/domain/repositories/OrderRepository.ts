import { Order } from '../entities/Order';

export interface OrderSyncLog {
  orderId: string;
  storeId: string;
  globalOrderId: string;
}

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findSyncLogByOrderId(orderId: string, storeId: string): Promise<OrderSyncLog | null>;
  createSyncLog(log: OrderSyncLog): Promise<void>;
}
