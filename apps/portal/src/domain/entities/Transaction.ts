export type TransactionStatus = 'success' | 'pending' | 'failed' | 'refunded';
export type TransactionMethod = 'cash' | 'credit_card' | 'qr_code' | 'bank_transfer' | 'wallet';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly uid: string,
    public readonly paymentMethod: TransactionMethod | string,
    public readonly status: TransactionStatus | string,
    public readonly amount: number,
    public readonly currency: string = 'THB',
    public readonly storeName: string = '',
    public readonly createdAt: Date = new Date(),
  ) {}
}
