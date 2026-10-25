import { Staff } from '../../domain/entities/Staff';

/** Center staff: the portal users (login, profile, permissions). */
export interface IStaffRepository {
  /** Merchant uid of the center staff, or null when the staff has no merchant (center staff are not merchant-scoped). */
  getMerchantUidByStaffId(staffId: string): Promise<string | null>;
  getStaffByUid(uid: string): Promise<Staff | null>;
  getStaffByUsername(username: string): Promise<Staff | null>;
}
