import { Merchant } from './Merchant';

export class CashierProfileStore {
  constructor(
    public readonly id: number,
    public readonly merchantId: number,
    public readonly uid: string,
    public readonly sid: string,
    public readonly nameEn: string,
    public readonly nameTh: string,
  ) {}
}

export class CashierProfileTerminal {
  constructor(
    public readonly uid: string,
    public readonly tid: string,
    public readonly nameEn: string,
    public readonly nameTh: string,
  ) {}
}

export class CashierProfileStaff {
  constructor(
    public readonly uid: string,
    public readonly username: string,
    public readonly fullName: string,
    public readonly status: string,
    public readonly roles: string[],
    public readonly pinHash: string,
    public readonly updatedAt: Date,
  ) {}
}

export class CashierProfile {
  constructor(
    public readonly merchant: Merchant,
    public readonly store: CashierProfileStore,
    public readonly terminal: CashierProfileTerminal,
    public readonly staffs: CashierProfileStaff[],
  ) {}
}
