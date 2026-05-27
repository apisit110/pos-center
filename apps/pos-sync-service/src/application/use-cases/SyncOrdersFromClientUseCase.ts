import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { Order, OrderItem, OrderStatus } from '../../domain/entities/Order';

export interface SyncOrderDTO {
  orderId: string;
  merchantId: string;
  storeId: string;
  terminalId: string | null;
  staffId: string;
  memberId: string | null;
  totalAmount: number;
  status: OrderStatus;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  createdAt: string;
}

export interface SyncOrderResponseDTO {
  orderId: string;
  globalOrderId: string;
  status: 'synced' | 'already_synced' | 'error';
}

export class SyncOrdersFromClientUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(ordersToSync: SyncOrderDTO[]): Promise<SyncOrderResponseDTO[]> {
    const results: SyncOrderResponseDTO[] = [];

    for (const orderData of ordersToSync) {
      try {
        // 1. Check idempotency
        const existingLog = await this.orderRepository.findSyncLogByOrderId(orderData.orderId, orderData.storeId);
        if (existingLog) {
          results.push({
            orderId: orderData.orderId,
            globalOrderId: existingLog.globalOrderId,
            status: 'already_synced',
          });
          continue;
        }

        // 2. Map items
        const items = orderData.items.map(item => new OrderItem(
          item.productId,
          item.quantity,
          item.price,
        ));

        // 3. Create order entity
        const order = new Order(
          '',
          orderData.orderId,
          orderData.merchantId,
          orderData.storeId,
          orderData.terminalId,
          orderData.staffId,
          orderData.memberId,
          items,
          orderData.totalAmount,
          orderData.status,
          false,
          new Date(orderData.createdAt),
        );

        // 4. Save order
        const savedOrder = await this.orderRepository.save(order);

        // 5. Create sync log
        await this.orderRepository.createSyncLog({
          orderId: orderData.orderId,
          storeId: orderData.storeId,
          globalOrderId: savedOrder.id,
        });

        results.push({
          orderId: orderData.orderId,
          globalOrderId: savedOrder.id,
          status: 'synced',
        });
      } catch (error) {
        console.error(`Error syncing order ${orderData.orderId}:`, error);
        results.push({
          orderId: orderData.orderId,
          globalOrderId: '',
          status: 'error',
        });
      }
    }

    return results;
  }
}
