export type StaffRole = 'manager' | 'cashier';
export type StaffStatus = 'active' | 'pending_sync' | 'inactive';

export class Staff {
  constructor(
    public readonly id: string,
    public readonly merchantId: string,
    public name: string,
    public role: StaffRole,
    public username?: string,
    public pinHash?: string,
    public status: StaffStatus = 'active',
    public createdAt?: Date,
    public merchantName?: string,
  ) {}
}
