import { ErrorKind } from './ErrorKind';

export class InternalServiceError {
  readonly name = 'Internal Service Error';

  constructor(
    readonly kind: string,
    readonly resCode: string,
    readonly resDesc: Record<string, string>,
  ) {}

  static ErrInternalServerError(): InternalServiceError {
    return new InternalServiceError(ErrorKind.INTERNAL_SERVER_ERROR, '5000', {
      en: 'Internal server error',
      th: 'เกิดข้อผิดพลาดภายในระบบ',
    });
  }
}
