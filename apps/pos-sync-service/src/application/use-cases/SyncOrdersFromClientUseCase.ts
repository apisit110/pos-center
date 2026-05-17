import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { Order, OrderItem, OrderStatus } from '../../domain/entities/Order';

export interface SyncOrderDTO {
  posTempId: string;
  merchantId: string;
  storeId: string;
  terminalId: string | null;
  staffId: string;
  memberId: string | null;
  totalAmount: number;
  status: OrderStatus;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  createdAt: string;
}

export interface SyncOrderResponseDTO {
  posTempId: string;
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
        const existingLog = await this.orderRepository.findSyncLogByPosTempId(orderData.posTempId, orderData.storeId);
        if (existingLog) {
          results.push({
            posTempId: orderData.posTempId,
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

        // 3. Create order entity — posTempId is the client-side order ID stored as uid
        const order = new Order(
          '',
          orderData.posTempId,
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
          posTempId: orderData.posTempId,
          storeId: orderData.storeId,
          globalOrderId: savedOrder.id,
        });

        results.push({
          posTempId: orderData.posTempId,
          globalOrderId: savedOrder.id,
          status: 'synced',
        });
      } catch (error) {
        console.error(`Error syncing order ${orderData.posTempId}:`, error);
        results.push({
          posTempId: orderData.posTempId,
          globalOrderId: '',
          status: 'error',
        });
      }
    }

    return results;
  }
}
