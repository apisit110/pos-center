import { Store } from '../../domain/entities/Store';
import { StoreRepository } from '../../application/repositories/StoreRepository';
import ApiClient from '../api/ApiClient';

export class ApiStoreRepository implements StoreRepository {
  public async getStores(merchantId?: string): Promise<Store[]> {
    const params = merchantId ? { merchantId } : {};
    const response = await ApiClient.get('/stores', { params });
    const data = response.data;
    return data.map((s: any) => new Store(s.id, s.merchantId, s.name, s.address, s.latitude || 0, s.longitude || 0));
  }

  public async getStoreById(id: string): Promise<Store | null> {
    try {
      const response = await ApiClient.get(`/stores/${id}`);
      const s = response.data;
      return new Store(s.id, s.merchantId, s.name, s.address, s.latitude || 0, s.longitude || 0);
    } catch (error) {
      return null;
    }
  }

  public async saveStore(store: Store): Promise<void> {
    if (store.id) {
      await ApiClient.put(`/stores/${store.id}`, store);
    } else {
      await ApiClient.post('/stores', store);
    }
  }
}
