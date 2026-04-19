export class Product {
  constructor(
    public readonly id: string,
    public readonly merchantId: string,
    public name: string,
    public sku: string,
    public barcode: string,
    public basePrice: number,
    public imageUrl: string | string[],
    public brand: string,
    public unitName: string
  ) {}
}
