import { Staff, StaffStatus } from '../../domain/entities/Staff';
import { StaffRepository, StaffFilter } from '../../domain/repositories/StaffRepository';
import ApiClient, { API_V1, cleanParams, unwrap } from '../api/ApiClient';

const STAFF_PATH = `${API_V1}/staff`;
const MERCHANTS_PATH = `${API_V1}/merchants`;

interface StaffResponse {
  uid: string;
  merchant_uid: string;
  merchant_name: string;
  name: string;
  role: string;
  username: string;
  status: StaffStatus;
  created_at: string;
}

interface MerchantStaffResponse {
  uid: string;
  name: string;
  role: string;
  username: string;
  status: StaffStatus;
}

const toStaff = (s: StaffResponse): Staff => {
  const createdAt = s.created_at ? new Date(s.created_at) : new Date();
  return new Staff(
    s.uid,
    s.merchant_uid ?? '',
    s.name,
    s.role,
    s.username ?? '',
    '',
    0,
    s.status ?? 'ACTIVE',
    null,
    createdAt,
    createdAt,
    s.merchant_name ?? '',
  );
};

export class ApiStaffRepository implements StaffRepository {
  public async getAllStaff(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }> {
    const params = cleanParams({
      page,
      limit,
      merchant_uid: filters?.merchantId,
      role: filters?.role,
      username: filters?.username,
      status: filters?.status,
      query: filters?.query,
      start_date: filters?.startDate,
      end_date: filters?.endDate,
    });
    const response = await ApiClient.get(STAFF_PATH, { params });
    const { items, total } = unwrap<{ items: StaffResponse[]; total: number }>(response);
    return {
      staff: items.map(toStaff),
      total,
    };
  }

  public async getStaffByMerchant(merchantId: string): Promise<Staff[]> {
    const response = await ApiClient.get(`${MERCHANTS_PATH}/${merchantId}/staff`);
    const data = unwrap<MerchantStaffResponse[]>(response);
    return data.map((s) => new Staff(
      s.uid,
      '',
      s.name,
      s.role,
      s.username ?? '',
      '',
      0,
      s.status ?? 'ACTIVE',
    ));
  }

  public async getStaffById(id: string): Promise<Staff | null> {
    try {
      const response = await ApiClient.get(`${STAFF_PATH}/${id}`);
      return toStaff(unwrap<StaffResponse>(response));
    } catch {
      return null;
    }
  }
}
