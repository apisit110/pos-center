// lower-case form of the API enums (`PENDING|APPROVED|FAILED|VOIDED|REFUNDED`, `CASH|QR`)
export type TransactionStatus = 'pending' | 'approved' | 'failed' | 'voided' | 'refunded';
export type TransactionMethod = 'cash' | 'qr';

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
    public readonly orderId: string = '',
  ) {}
}
