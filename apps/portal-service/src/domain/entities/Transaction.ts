export class Transaction {
  constructor(
    public readonly id: string,
    public readonly uid: string,
    public readonly paymentMethod: string,
    public readonly status: string,
    public readonly amount: number,
    public readonly currency: string = 'THB',
    public readonly storeNameEn: string = '',
    public readonly storeNameTh: string = '',
    public readonly staffName: string = '',
    public readonly createdAt: Date = new Date(),
    public readonly orderId: string = '',
  ) {}
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
  ) {}
}

export class TransactionDetail {
  constructor(
    public readonly transaction: Transaction,
    /** uid of the merchant the transaction belongs to, empty string if not found */
    public readonly merchantUid: string,
    public readonly partnerId: string,
    /** tid of the terminal, empty string if not found */
    public readonly terminalId: string,
    public readonly orderStatus: string,
    public readonly orderTotalAmount: number,
    public readonly items: TransactionItem[],
  ) {}
}
