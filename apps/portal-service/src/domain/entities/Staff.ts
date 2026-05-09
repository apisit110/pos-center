export type StaffRole = 'manager' | 'cashier';

export class Staff {
  constructor(
    public readonly id: string,
    public readonly merchantId: string,
    public name: string,
    public role: StaffRole
  ) {}
}
