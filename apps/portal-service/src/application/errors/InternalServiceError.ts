export class InternalServiceError {
  readonly name = 'Internal Service Error';

  constructor(
    readonly kind: string,
    readonly resCode: string,
    readonly resDesc: Record<string, string>,
  ) {}
}
