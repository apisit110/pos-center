export class InvalidCredentialsError extends Error {
  public status = 401;
  constructor() {
    super('Invalid credentials');
  }
}

export class AccountLockedError extends Error {
  public status = 423;
  constructor() {
    super('Account locked, please try again later');
  }
}
