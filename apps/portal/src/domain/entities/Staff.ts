export type StaffStatus = 'active' | 'pending_sync' | 'inactive';

export class Staff {
  constructor(
    public readonly id: string,
    public readonly merchantUid: string,
    public name: string,
    public role: string,
    public username: string = '',
    public fullName: string = '',
    public roleId: number = 0,
    public status: StaffStatus = 'active',
    public syncId: string | null = null,
    public updatedAt: Date = new Date()
  ) {}
}
