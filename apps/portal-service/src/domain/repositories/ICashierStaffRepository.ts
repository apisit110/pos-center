import { Staff } from '../../domain/entities/Staff';

export interface StaffFilter {
  merchantUid?: string;
  role?: string;
  username?: string;
  status?: string;
  /** created_at >= startDate */
  startDate?: Date;
  /** created_at <= endDate */
  endDate?: Date;
  query?: string;
}

/** Cashier staff: the pos users of a merchant. */
export interface ICashierStaffRepository {
  /** Ordered by internal id descending (newest first). `merchantId` of the result is the merchant uid. */
  getStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }>;
  getStaffByMerchant(merchantUid: string): Promise<Staff[]>;
  /** `merchantId` of the result is the merchant uid, merchant names are filled. */
  getStaffByUid(uid: string): Promise<Staff | null>;
  /** id of every `cashier_role`, by name */
  getRoleIdsByName(): Promise<Map<string, number>>;
}
