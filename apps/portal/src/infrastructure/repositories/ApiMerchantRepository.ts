import { Merchant } from '../../domain/entities/Merchant';
import { MerchantRepository } from '../../application/repositories/MerchantRepository';
import ApiClient from '../api/ApiClient';

export class ApiMerchantRepository implements MerchantRepository {
  public async getMerchant(id: string): Promise<Merchant | null> {
    try {
      const response = await ApiClient.get(`/merchants/${id}`);
      const data = response.data;
      return new Merchant(data.id, data.name);
    } catch (error) {
      return null;
    }
  }

  public async getMerchants(): Promise<Merchant[]> {
    const response = await ApiClient.get('/merchants');
    const data = response.data;
    return data.map((m: any) => new Merchant(m.id, m.name));
  }

  public async updateMerchant(merchant: Merchant): Promise<void> {
    await ApiClient.put(`/merchants/${merchant.id}`, {
      name: merchant.name,
    });
  }
}
