import { Store } from '../../domain/entities/Store';
import { StoreRepository } from '../../application/repositories/StoreRepository';

export class MockStoreRepository implements StoreRepository {
  private stores: Store[] = [
    new Store('S-001', 'M-123', 'Main Branch', '123 Sukhumvit, Bangkok', 13.7367, 100.5231),
    new Store('S-002', 'M-123', 'Siam Square', 'Siam Square Soi 3, Bangkok', 13.7445, 100.5342),
    new Store('S-003', 'M-456', 'Bakery Corner', 'Ari Soi 1, Bangkok', 13.7796, 100.5445)
  ];

  public async getStores(merchantId: string): Promise<Store[]> {
    return this.stores.filter(s => s.merchantId === merchantId);
  }

  public async getStoreById(id: string): Promise<Store | null> {
    return this.stores.find(s => s.id === id) || null;
  }

  public async saveStore(store: Store): Promise<void> {
    const index = this.stores.findIndex(s => s.id === store.id);
    if (index !== -1) {
      this.stores[index] = store;
    } else {
      this.stores.push(store);
    }
  }
}
