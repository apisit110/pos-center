import { ErrorKind } from './ErrorKind';

export class ValidationError {
  readonly name = 'Validation Error';

  constructor(
    readonly kind: string,
    readonly resCode: string,
    readonly resDesc: Record<string, string>,
    readonly details?: unknown,
  ) {}

  static ErrInvalidRequest(details?: unknown): ValidationError {
    return new ValidationError(
      ErrorKind.BAD_REQUEST,
      '4000',
      { en: 'Invalid request', th: 'คำขอไม่ถูกต้อง' },
      details,
    );
  }
}
