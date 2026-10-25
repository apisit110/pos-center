import { NameLanguage, pickName } from './LocalizedName';

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
    public merchantNameEn: string = '',
    public merchantNameTh: string = '',
  ) {}

  public merchantName(language: NameLanguage): string {
    return pickName(language, this.merchantNameEn, this.merchantNameTh);
  }
}
