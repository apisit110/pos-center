// errorMiddleware responds with `status` and `message` of the error
export class SyncError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'SyncError';
  }

  static invalidCredential() {
    return new SyncError(401, 'Invalid credential');
  }

  static invalidToken() {
    return new SyncError(401, 'Invalid token');
  }

  /** the client requests a new token and retries */
  static tokenExpired() {
    return new SyncError(401, 'Token expired');
  }

  static tooManyTokenRequests() {
    return new SyncError(429, 'Too many failed token requests');
  }

  static tokenScopeMismatch() {
    return new SyncError(403, 'Request does not match the token');
  }

  /** the request did not come through CloudFront */
  static forbiddenOrigin() {
    return new SyncError(403, 'Forbidden');
  }

  static terminalNotFound() {
    return new SyncError(404, 'Terminal not found');
  }
}
