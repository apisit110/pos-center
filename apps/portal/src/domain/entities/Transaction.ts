import { NameLanguage, pickName } from './LocalizedName';

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
    public readonly storeNameEn: string = '',
    public readonly storeNameTh: string = '',
    public readonly staffName: string = '',
    public readonly createdAt: Date = new Date(),
    public readonly orderId: string = '',
  ) {}

  public storeName(language: NameLanguage): string {
    return pickName(language, this.storeNameEn, this.storeNameTh);
  }
}

export class TransactionItem {
  constructor(
    public readonly productUid: string,
    public readonly nameEn: string,
    public readonly nameTh: string,
    public readonly sku: string,
    public readonly barcode: string,
    public readonly quantity: number,
    public readonly price: number,
    public readonly total: number,
  ) {}

  public displayName(language: NameLanguage): string {
    return pickName(language, this.nameEn, this.nameTh);
  }
}

export class TransactionDetail {
  constructor(
    public readonly transaction: Transaction,
    public readonly partnerId: string,
    public readonly terminalId: string,
    public readonly orderStatus: string,
    public readonly orderTotalAmount: number,
    public readonly items: TransactionItem[],
  ) {}
}
