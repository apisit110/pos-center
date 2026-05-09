export class Store {
  constructor(
    public readonly uid: string,
    public readonly sid: string,
    public readonly merchantId: string,
    public readonly mid: string,
    public name: string,
    public address: string,
    public latitude: number,
    public longitude: number
  ) {}
}
