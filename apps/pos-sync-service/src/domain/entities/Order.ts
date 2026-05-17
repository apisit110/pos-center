export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export class OrderItem {
  constructor(
    public readonly productId: number,
    public readonly quantity: number,
    public readonly price: number,
  ) {}
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly uid: string,
    public readonly merchantId: string,
    public readonly storeId: string,
    public readonly terminalId: string | null,
    public readonly staffId: string,
    public readonly memberId: string | null,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public status: OrderStatus,
    public readonly isSynced: boolean,
    public readonly createdAt: Date,
  ) {}
}
