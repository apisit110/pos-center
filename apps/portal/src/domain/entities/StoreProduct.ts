export class StoreProduct {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
    public readonly productId: string,
    public stock: number,
    public price: number
  ) {}
}
