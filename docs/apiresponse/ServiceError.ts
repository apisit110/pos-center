import ErrorKind from "./ErrorKind"

class ServiceError {
  name: string
  kind: string
  resCode: string
  resDesc: Record<string, string>
  additional?: string

  constructor(
    kind: string,
    resCode: string,
    resDesc: Record<string, string>,
    additional?: string
  ) {
    this.name = "Service Error"
    this.kind = kind
    this.resCode = resCode
    this.resDesc = resDesc
    this.additional = additional
  }

  public static ErrIncorrectUsernameOrPin(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.BAD_REQUEST,
      resCode: "4001",
      resDesc: {
        en: "Cannot log in due to incorrect username or PIN",
        th: "ไม่สามารถเข้าสู่ระบบได้เนื่องจากชื่อผู้ใช้หรือรหัส PIN ไม่ถูกต้อง"
      },
      additional: undefined
    }
  }
  public static ErrPinLocked(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.BAD_REQUEST,
      resCode: "4002",
      resDesc: {
        en: "Your account has been locked due to too many failed login attempts. Please try again later.",
        th: "บัญชีของคุณถูกล็อกเนื่องจากมีความพยายามเข้าสู่ระบบล้มเหลวมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง"
      },
      additional: undefined
    }
  }
  public static ErrUserPending(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.BAD_REQUEST,
      resCode: "4003",
      resDesc: {
        en: "Your account is pending approval",
        th: "บัญชีของคุณอยู่ระหว่างรอการอนุมัติ"
      },
      additional: undefined
    }
  }
  public static ErrUserInactive(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.BAD_REQUEST,
      resCode: "4004",
      resDesc: {
        en: "Your account is inactive",
        th: "บัญชีของคุณไม่สามารถใช้งานได้"
      },
      additional: undefined
    }
  }
  public static ErrUserSuspended(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.BAD_REQUEST,
      resCode: "4005",
      resDesc: {
        en: "Your account has been suspended",
        th: "บัญชีของคุณถูกระงับการใช้งาน"
      },
      additional: undefined
    }
  }
}