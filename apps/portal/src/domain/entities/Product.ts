export class Product {
  constructor(
    public readonly uid: string,
    public readonly nameEn: string | null,
    public readonly nameTh: string,
    public readonly brandEn: string | null,
    public readonly brandTh: string | null,
    public readonly basePrice: number,
    public readonly unitName: string,
    public readonly barcode: string,
    public readonly imageUrl: string[]
  ) {}

  get id(): string {
    return this.uid;
  }

  get name(): string {
    return this.nameEn || this.nameTh;
  }

  get brand(): string {
    return this.brandEn || this.brandTh || 'No Brand';
  }
}
