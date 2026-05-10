export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export class OrderItem {
  constructor(
    public readonly productId: string | null,
    public readonly productUid: string | null,
    public readonly name: string,
    public readonly quantity: number,
    public readonly price: number,
    public readonly subtotal: number
  ) {}
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly uid: string,
    public readonly orderNumber: string,
    public readonly merchantId: string,
    public readonly storeId: string,
    public readonly terminalId: string | null,
    public readonly staffId: string | null,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public status: OrderStatus,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
