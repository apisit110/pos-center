import axios from 'axios';
import { Store } from '../../domain/entities/Store';
import { StoreRepository } from '../../application/repositories/StoreRepository';

export class MockStoreRepository implements StoreRepository {
  private stores: Store[] = [];
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;
    try {
      const response = await axios.get('/constants/master_store.json');
      const data = response.data;
      this.stores = data.map((s: any) => new Store(
        s.id,
        String(s.merchant_id),
        s.name,
        s.address,
        s.latitude,
        s.longitude
      ));
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load store master data:', error);
    }
  }

  public async getStores(merchantId: string): Promise<Store[]> {
    await this.initialize();
    return this.stores.filter(s => s.merchantId === merchantId);
  }

  public async getStoreById(id: string): Promise<Store | null> {
    await this.initialize();
    return this.stores.find(s => s.id === id) || null;
  }

  public async saveStore(store: Store): Promise<void> {
    await this.initialize();
    const index = this.stores.findIndex(s => s.id === store.id);
    if (index !== -1) {
      this.stores[index] = store;
    } else {
      this.stores.push(store);
    }
  }
}
