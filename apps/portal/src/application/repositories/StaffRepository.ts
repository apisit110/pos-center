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

export interface StaffRepository {
  getStaffByMerchant(merchantId: string): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | null>;
  saveStaff(staff: Staff): Promise<void>;
  getAllStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }>;
}
