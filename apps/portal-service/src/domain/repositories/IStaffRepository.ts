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

export interface IStaffRepository {
  /** Ordered by internal id descending (newest first). `merchantId` of the result is the merchant uid. */
  getStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }>;
  getStaffByMerchant(merchantUid: string): Promise<Staff[]>;
  getMerchantUidByStaffId(staffId: string): Promise<string | null>;
  /** `merchantId` of the result is the merchant uid, `merchantName` is filled. */
  getStaffByUid(uid: string): Promise<Staff | null>;
  getStaffByUsername(username: string): Promise<Staff | null>;
  save(staff: Staff): Promise<void>;
}
