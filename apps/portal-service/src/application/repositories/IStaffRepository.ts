import { Staff } from '../../domain/entities/Staff';

export interface StaffFilter {
  merchantId?: string;
  role?: string;
  username?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  query?: string;
}

export interface IStaffRepository {
  getStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }>;
  getStaffByMerchant(merchantUid: string): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | null>;
  save(staff: Staff): Promise<void>;
}
