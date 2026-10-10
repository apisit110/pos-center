export class Ok<T = undefined> {
  constructor(
    readonly httpStatus: number,
    readonly resCode: string,
    readonly resDesc: string,
    readonly data?: T,
  ) {}

  static success<T>(data?: T, httpStatus = 200): Ok<T> {
    return new Ok(httpStatus, '0000', '', data);
  }

  toBody() {
    return { res_code: this.resCode, res_desc: this.resDesc, data: this.data };
  }
}
