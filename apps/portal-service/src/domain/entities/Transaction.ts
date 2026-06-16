export class Transaction {
  constructor(
    public readonly id: string,
    public readonly uid: string,
    public readonly paymentMethod: string,
    public readonly status: string,
    public readonly amount: number,
    public readonly currency: string = 'THB',
    public readonly storeName: string = '',
    public readonly createdAt: Date = new Date(),
    public readonly orderId: string = '',
  ) {}
}
