export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class User {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public fullName: string,
    public pinHash: string,
    public roleId: number,
    public status: UserStatus = UserStatus.ACTIVE,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}

