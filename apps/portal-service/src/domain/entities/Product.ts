export interface Brand {
  uid: string;
  nameEn: string;
  nameTh: string;
}

export class Product {
  constructor(
    public readonly id: string,
    public readonly merchantId: string,
    public readonly partnerId: string,
    public nameEn: string,
    public nameTh: string,
    public sku: string,
    public barcode: string,
    public basePrice: number,
    public imageUrl: string,
    public brand: Brand | null,
    public unitName: string
  ) {}
}
