export class Product {
  constructor(
    public readonly id: string,
    public readonly merchantId: string,
    public readonly storeId: string,
    public name: string,
    public sku: string,
    public barcode: string,
    public basePrice: number,
    public imageUrl: string,
    public brand: string,
    public syncVersion: number = 0
  ) {}
}
