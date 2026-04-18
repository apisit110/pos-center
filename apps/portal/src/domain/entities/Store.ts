export class Store {
  constructor(
    public readonly id: string,
    public readonly merchantId: string,
    public name: string,
    public address: string,
    public latitude: number,
    public longitude: number
  ) {}
}
