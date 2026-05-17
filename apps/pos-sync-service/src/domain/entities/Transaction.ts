export class Transaction {
  constructor(
    public readonly id: string,
    public readonly uid: string,
    public readonly orderId: string, // Local Order ID from POS
    public readonly merchantId: string,
    public readonly terminalId: string | null,
    public readonly amount: number,
    public readonly paymentMethod: string,
    public readonly status: string,
    public readonly staffName: string,
    public readonly createdAt: Date,
  ) {}
}
