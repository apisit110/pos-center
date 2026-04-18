import { Staff } from '../../domain/entities/Staff';
import { StaffRepository } from '../../application/repositories/StaffRepository';

export class MockStaffRepository implements StaffRepository {
  private staffs: Staff[] = [
    new Staff('ST-001', 'M-123', 'John Doe', 'Manager'),
    new Staff('ST-002', 'M-123', 'Jane Smith', 'Staff'),
    new Staff('ST-003', 'M-456', 'Bob Baker', 'Owner')
  ];

  public async getStaffByMerchant(merchantId: string): Promise<Staff[]> {
    return this.staffs.filter(s => s.merchantId === merchantId);
  }

  public async getStaffById(id: string): Promise<Staff | null> {
    return this.staffs.find(s => s.id === id) || null;
  }

  public async saveStaff(staff: Staff): Promise<void> {
    const index = this.staffs.findIndex(s => s.id === staff.id);
    if (index !== -1) {
      this.staffs[index] = staff;
    } else {
      this.staffs.push(staff);
    }
  }
}
