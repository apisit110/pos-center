import { ErrorKind } from './ErrorKind';

export class ServiceError {
  readonly name = 'Service Error';

  constructor(
    readonly kind: string,
    readonly resCode: string,
    readonly resDesc: Record<string, string>,
    readonly additional?: string,
  ) {}

  static ErrIncorrectUsernameOrPin(): ServiceError {
    return new ServiceError(ErrorKind.BAD_REQUEST, '4001', {
      en: 'Cannot log in due to incorrect username or PIN',
      th: 'ไม่สามารถเข้าสู่ระบบได้เนื่องจากชื่อผู้ใช้หรือรหัส PIN ไม่ถูกต้อง',
    });
  }

  static ErrPinLocked(): ServiceError {
    return new ServiceError(ErrorKind.BAD_REQUEST, '4002', {
      en: 'Your account has been locked due to too many failed login attempts. Please try again later.',
      th: 'บัญชีของคุณถูกล็อกเนื่องจากมีความพยายามเข้าสู่ระบบล้มเหลวมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
    });
  }

  static ErrUserPending(): ServiceError {
    return new ServiceError(ErrorKind.BAD_REQUEST, '4003', {
      en: 'Your account is pending approval',
      th: 'บัญชีของคุณอยู่ระหว่างรอการอนุมัติ',
    });
  }

  static ErrUserInactive(): ServiceError {
    return new ServiceError(ErrorKind.BAD_REQUEST, '4004', {
      en: 'Your account is inactive',
      th: 'บัญชีของคุณไม่สามารถใช้งานได้',
    });
  }

  static ErrUserSuspended(): ServiceError {
    return new ServiceError(ErrorKind.BAD_REQUEST, '4005', {
      en: 'Your account has been suspended',
      th: 'บัญชีของคุณถูกระงับการใช้งาน',
    });
  }

  static ErrTokenInvalide(): ServiceError {
    return new ServiceError(ErrorKind.BAD_REQUEST, '4006', {
      en: 'The token is invalid.',
      th: 'โทเค็นไม่ถูกต้อง',
    });
  }

  static ErrTokenExpire(): ServiceError {
    return new ServiceError(ErrorKind.BAD_REQUEST, '4007', {
      en: 'The token has expired.',
      th: 'โทเค็นหมดอายุแล้ว',
    });
  }

  static ErrPermissionDenied(): ServiceError {
    return new ServiceError(ErrorKind.BAD_REQUEST, '4008', {
      en: 'You do not have permission to perform this action.',
      th: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
    });
  }

  static ErrStaffNotFound(): ServiceError {
    return new ServiceError(ErrorKind.NOT_FOUND, '4009', {
      en: 'The specified staff member could not be found.',
      th: 'ไม่พบข้อมูลพนักงานในระบบ',
    });
  }

  static ErrForbidden(): ServiceError {
    return new ServiceError(ErrorKind.FORBIDDEN, '4010', {
      en: 'You are not allowed to access this resource.',
      th: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
    });
  }

  static ErrMerchantNotFound(): ServiceError {
    return new ServiceError(ErrorKind.NOT_FOUND, '4011', {
      en: 'The specified merchant could not be found.',
      th: 'ไม่พบข้อมูลร้านค้า (merchant) ในระบบ',
    });
  }

  static ErrStoreNotFound(): ServiceError {
    return new ServiceError(ErrorKind.NOT_FOUND, '4012', {
      en: 'The specified store could not be found.',
      th: 'ไม่พบข้อมูลสาขา (store) ในระบบ',
    });
  }

  static ErrProductNotFound(): ServiceError {
    return new ServiceError(ErrorKind.NOT_FOUND, '4013', {
      en: 'The specified product could not be found.',
      th: 'ไม่พบข้อมูลสินค้าในระบบ',
    });
  }

  static ErrPayloadTooLarge(): ServiceError {
    return new ServiceError(ErrorKind.PAYLOAD_TOO_LARGE, '4130', {
      en: 'The request body is too large.',
      th: 'ขนาดข้อมูลที่ส่งมาใหญ่เกินกำหนด',
    });
  }

  static ErrTooManyRequests(): ServiceError {
    return new ServiceError(ErrorKind.TOO_MANY_REQUESTS, '4290', {
      en: 'Too many requests. Please try again later.',
      th: 'มีการส่งคำขอมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
    });
  }

  static ErrProductBarcodeDuplicate(): ServiceError {
    return new ServiceError(ErrorKind.BAD_REQUEST, '4014', {
      en: 'The barcode already exists in this merchant.',
      th: 'บาร์โค้ดนี้มีอยู่แล้วในร้านค้า (merchant) นี้',
    });
  }

  static ErrTransactionNotFound(): ServiceError {
    return new ServiceError(ErrorKind.NOT_FOUND, '4015', {
      en: 'The specified transaction could not be found.',
      th: 'ไม่พบข้อมูลรายการธุรกรรมในระบบ',
    });
  }

  static ErrMerchantCredentialExists(): ServiceError {
    return new ServiceError(ErrorKind.BAD_REQUEST, '4016', {
      en: 'The merchant already has a credential for this provider.',
      th: 'ร้านค้า (merchant) นี้มี credential ของผู้ให้บริการนี้อยู่แล้ว',
    });
  }

  static ErrMerchantCredentialNotFound(): ServiceError {
    return new ServiceError(ErrorKind.NOT_FOUND, '4017', {
      en: 'The merchant credential could not be found.',
      th: 'ไม่พบ credential ของร้านค้า (merchant) ในระบบ',
    });
  }
}
