import { Staff } from '../../domain/entities/Staff';
import { StaffRepository, StaffFilter } from '../../domain/repositories/StaffRepository';
import ApiClient from '../api/ApiClient';

export class ApiStaffRepository implements StaffRepository {
  public async getAllStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }> {
    const params = { page, limit, ...filters };
    const response = await ApiClient.get('/staff', { params });
    const { staff, total } = response.data;
    return {
      staff: staff.map((s: any) => new Staff(
        s.id,
        s.merchantId ?? '',
        s.name,
        s.role,
        s.username ?? '',
        '',
        0,
        s.status ?? 'active',
        null,
        s.createdAt ? new Date(s.createdAt) : new Date(),
        s.createdAt ? new Date(s.createdAt) : new Date(),
        s.merchantName ?? '',
      )),
      total,
    };
  }

  public async getStaffByMerchant(merchantId: string): Promise<Staff[]> {
    const response = await ApiClient.get(`/merchants/${merchantId}/staff`);
    const data = response.data;
    return data.map((s: any) => new Staff(
      s.uid,
      '',
      s.name,
      s.role,
      s.username ?? '',
      '',
      0,
      s.status ?? 'active',
    ));
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
