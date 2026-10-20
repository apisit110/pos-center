class InternalServiceError {
  name: string
  kind: string
  resCode: string
  resDesc: Record<string, string>

  constructor(kind: string, resCode: string, resDesc: Record<string, string>) {
    this.name = "Internal Service Error"
    this.kind = kind
    this.resCode = resCode
    this.resDesc = resDesc
  }

  public static ErrInternalServerError(): InternalServiceError {
    return new InternalServiceError("500", "5000", {
      en: "Internal server error",
      th: "เกิดข้อผิดพลาดภายในระบบ"
    })
  }
}
