import { Staff } from '../../domain/entities/Staff';
import { StaffRepository } from '../../application/repositories/StaffRepository';
import ApiClient from '../api/ApiClient';

export class ApiStaffRepository implements StaffRepository {
  public async getStaffByMerchant(merchantId: string): Promise<Staff[]> {
    const response = await ApiClient.get(`/merchants/${merchantId}/staff`);
    const data = response.data;
    return data.map((s: any) => new Staff(s.id, s.merchantUid ?? s.merchantId, s.name, s.role));
  }

  public async getStaffById(id: string): Promise<Staff | null> {
    try {
      const response = await ApiClient.get(`/staff/${id}`);
      const s = response.data;
      return new Staff(s.id, s.merchantUid ?? s.merchantId, s.name, s.role);
    } catch (error) {
      return null;
    }
  }

  public async saveStaff(staff: Staff): Promise<void> {
    if (staff.id) {
      await ApiClient.put(`/staff/${staff.id}`, staff);
    } else {
      await ApiClient.post('/staff', staff);
    }
  }
}
