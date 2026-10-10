import ErrorKind from "./ErrorKind"

class ValidationError {
  name: string
  kind: string
  resCode: string
  resDesc: Record<string, string>
  details?: string

  constructor(
    kind: string,
    resCode: string,
    resDesc: Record<string, string>,
    details: string,
  ) {
    this.name = "Validation Error"
    this.kind = kind
    this.resCode = resCode
    this.resDesc = resDesc
    this.details = details
  }

  public static ErrInvalidRequest(): ValidationError {
    return {
      name: this.name,
      kind: ErrorKind.BAD_REQUEST,
      resCode: "4000",
      resDesc: {
        en: "Invalid request",
        th: "คำขอไม่ถูกต้อง"
      },
      details: undefined
    }
  }
}
