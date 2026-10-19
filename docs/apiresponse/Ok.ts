class Ok {
  httpStatus: number
  resCode: string
  resDesc: string
  data: any

  constructor(
    httpStatus: number,
    resCode: string,
    resDesc: string,
    data: any,
  ) {
    this.httpStatus = httpStatus
    this.resCode = resCode
    this.resDesc = resDesc
    this.data = data
  }
}
