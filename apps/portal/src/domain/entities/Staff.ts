export type StaffStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'SUSPENDED';

export class Staff {
  constructor(
    public readonly id: string,
    public readonly merchantUid: string,
    public name: string,
    public role: string,
    public username: string = '',
    public fullName: string = '',
    public roleId: number = 0,
    public status: StaffStatus = 'ACTIVE',
    public syncId: string | null = null,
    public updatedAt: Date = new Date(),
    public createdAt: Date = new Date(),
    public merchantName: string = '',
  ) {}
}
