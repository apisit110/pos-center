export type StaffRole = 'manager' | 'cashier';
export type StaffStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'SUSPENDED';

export class Staff {
  constructor(
    public readonly id: string,
    public readonly merchantId: string,
    public name: string,
    public role: StaffRole,
    public username?: string,
    public pinHash?: string,
    public status: StaffStatus = 'ACTIVE',
    public createdAt?: Date,
    public merchantNameEn?: string,
    public merchantNameTh?: string,
  ) {}
}
