import { Merchant } from '../../domain/entities/Merchant';
import { MerchantRepository, MerchantRegistrationRequest, MerchantFilter } from '../../domain/repositories/MerchantRepository';
import ApiClient from '../api/ApiClient';

export class ApiMerchantRepository implements MerchantRepository {
  public async getMerchant(uid: string): Promise<Merchant | null> {
    try {
      const response = await ApiClient.get(`/merchants/${uid}`);
      const data = response.data;
      return new Merchant(data.uid || data.id, data.mid, data.name);
    } catch (error) {
      return null;
    }
  }

  public async getMerchants(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }> {
    const params = { page, limit, ...filters };
    const response = await ApiClient.get('/merchants', { params });
    const { items, total } = response.data;
    return {
      merchants: items.map((m: any) => new Merchant(m.uid || m.id, m.mid, m.name)),
      total,
    };
  }

  public async updateMerchant(merchant: Merchant): Promise<void> {
    await ApiClient.put(`/merchants/${merchant.uid}`, {
      name: merchant.name,
    });
  }

  public async registerMerchant(request: MerchantRegistrationRequest): Promise<Merchant> {
    const response = await ApiClient.post('/merchants', request);
    const data = response.data;
    return new Merchant(data.uid || data.id, data.mid, data.name);
  }
}
