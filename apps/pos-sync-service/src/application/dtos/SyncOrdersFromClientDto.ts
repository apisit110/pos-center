import { OrderStatus } from '../../domain/entities/Order';

export interface SyncOrderRequest {
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

export interface SyncOrderResult {
  orderId: string;
  globalOrderId: string;
  status: 'synced' | 'already_synced' | 'error';
}

export interface SyncOrdersFromClientRequest {
  orders: SyncOrderRequest[];
}

export interface SyncOrdersFromClientResponse {
  /** same order as request */
  results: SyncOrderResult[];
}
