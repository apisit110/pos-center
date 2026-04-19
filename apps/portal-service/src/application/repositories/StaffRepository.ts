import { Staff } from '../../domain/entities/Staff';

export interface StaffFilter {
  merchantId?: string;
  role?: string;
  query?: string;
}

export interface StaffRepository {
  getStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }>;
  getStaffById(id: string): Promise<Staff | null>;
}
