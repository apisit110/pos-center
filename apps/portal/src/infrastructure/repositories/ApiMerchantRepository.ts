import { Merchant } from '../../domain/entities/Merchant';
import { MerchantRepository, MerchantRegistrationRequest, MerchantFilter } from '../../domain/repositories/MerchantRepository';
import ApiClient, { API_V1, cleanParams, unwrap } from '../api/ApiClient';

const MERCHANTS_PATH = `${API_V1}/merchants`;

interface MerchantResponse {
  uid: string;
  mid: string;
  name: string;
}

const toMerchant = (m: MerchantResponse): Merchant => new Merchant(m.uid, m.mid, m.name);

export class ApiMerchantRepository implements MerchantRepository {
  public async getMerchant(uid: string): Promise<Merchant | null> {
    try {
      const response = await ApiClient.get(`${MERCHANTS_PATH}/${uid}`);
      return toMerchant(unwrap<MerchantResponse>(response));
    } catch {
      return null;
    }
  }

  public async getMerchants(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }> {
    const params = cleanParams({ page, limit, mid: filters?.mid, name: filters?.name });
    const response = await ApiClient.get(MERCHANTS_PATH, { params });
    const { items, total } = unwrap<{ items: MerchantResponse[]; total: number }>(response);
    return {
      merchants: items.map(toMerchant),
      total,
    };
  }

  public async registerMerchant(request: MerchantRegistrationRequest): Promise<Merchant> {
    // single request carrying staff, stores and terminals (see docs/portal/flow/merchant/post-merchant.md)
    const body = {
      name: request.merchantName,
      staff_members: request.staffMembers.map((s) => ({
        full_name: s.fullName,
        pin: s.pin,
        role: s.role,
      })),
      stores: request.stores.map((store) => ({
        name: store.name,
        address: store.address,
        latitude: Number(store.latitude),
        longitude: Number(store.longitude),
        terminals: store.terminals.map((t) => ({ name: t.name })),
      })),
    };
    const response = await ApiClient.post(MERCHANTS_PATH, body);
    return toMerchant(unwrap<MerchantResponse>(response));
  }
}
