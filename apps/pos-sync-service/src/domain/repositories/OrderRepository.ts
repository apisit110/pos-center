import { Order } from '../entities/Order';

export interface OrderSyncLog {
  posTempId: string;
  storeId: string;
  globalOrderId: string;
}

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findSyncLogByPosTempId(posTempId: string, storeId: string): Promise<OrderSyncLog | null>;
  createSyncLog(log: OrderSyncLog): Promise<void>;
}
