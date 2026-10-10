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
    return new ServiceError(ErrorKind.BAD_REQUEST, '4009', {
      en: 'The specified staff member could not be found.',
      th: 'ไม่พบข้อมูลพนักงานในระบบ',
    });
  }
}
