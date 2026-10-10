export class NotFoundError extends Error {
  public status = 404;
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends Error {
  public status = 403;
  constructor(message = 'Forbidden') {
    super(message);
  }
}
