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
  public static ErrTokenInvalide(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.BAD_REQUEST,
      resCode: "4006",
      resDesc: {
        en: "The token is invalid.",
        th: "โทเค็นไม่ถูกต้อง"
      },
      additional: undefined
    }
  }
  public static ErrTokenExpire(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.BAD_REQUEST,
      resCode: "4007",
      resDesc: {
        en: "The token has expired.",
        th: "โทเค็นหมดอายุแล้ว"
      },
      additional: undefined
    }
  }
  public static ErrPermissionDenied(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.BAD_REQUEST,
      resCode: "4008",
      resDesc: {
        en: "You do not have permission to perform this action.",
        th: "คุณไม่มีสิทธิ์ในการดำเนินการนี้"
      },
      additional: undefined
    }
  }
  public static ErrStaffNotFound(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.NOT_FOUND,
      resCode: "4009",
      resDesc: {
        en: "The specified staff member could not be found.",
        th: "ไม่พบข้อมูลพนักงานในระบบ"
      },
      additional: undefined
    }
  }
  public static ErrForbidden(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.FORBIDDEN,
      resCode: "4010",
      resDesc: {
        en: "You are not allowed to access this resource.",
        th: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้"
      },
      additional: undefined
    }
  }
  public static ErrMerchantNotFound(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.NOT_FOUND,
      resCode: "4011",
      resDesc: {
        en: "The specified merchant could not be found.",
        th: "ไม่พบข้อมูลร้านค้า (merchant) ในระบบ"
      },
      additional: undefined
    }
  }
  public static ErrStoreNotFound(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.NOT_FOUND,
      resCode: "4012",
      resDesc: {
        en: "The specified store could not be found.",
        th: "ไม่พบข้อมูลสาขา (store) ในระบบ"
      },
      additional: undefined
    }
  }
  public static ErrProductNotFound(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.NOT_FOUND,
      resCode: "4013",
      resDesc: {
        en: "The specified product could not be found.",
        th: "ไม่พบข้อมูลสินค้าในระบบ"
      },
      additional: undefined
    }
  }
  public static ErrProductBarcodeDuplicate(): ServiceError {
    return {
      name: this.name,
      kind: ErrorKind.BAD_REQUEST,
      resCode: "4014",
      resDesc: {
        en: "The barcode already exists in this merchant.",
        th: "บาร์โค้ดนี้มีอยู่แล้วในร้านค้า (merchant) นี้"
      },
      additional: undefined
    }
  }
}
