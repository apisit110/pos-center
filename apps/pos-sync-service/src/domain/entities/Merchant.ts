/** Merchant authenticated by its merchant credential (provider `POS_CASHIER`). */
export class Merchant {
  constructor(
    public readonly id: number,
    public readonly uid: string,
    public readonly partnerId: string,
    public readonly nameEn: string,
    public readonly nameTh: string,
  ) {}
}
