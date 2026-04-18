import { Staff } from '../../domain/entities/Staff';

export interface StaffRepository {
  getStaffByMerchant(merchantId: string): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | null>;
  saveStaff(staff: Staff): Promise<void>;
}
