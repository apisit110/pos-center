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

export class UserSyncLog {
  constructor(
    public readonly id: number,
    public readonly posTempId: string,
    public readonly originBranchId: number,
    public readonly globalUserId: string
  ) {}
}
