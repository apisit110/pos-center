import { StoreProduct } from '../../domain/entities/StoreProduct';
import { StoreProductRepository } from '../../application/repositories/StoreProductRepository';

export class MockStoreProductRepository implements StoreProductRepository {
  private storeProducts: StoreProduct[] = [
    new StoreProduct('SP-001', 'S-001', 'P75Lx5mwPw8EC02yY2fnTt8iUhAhe7', 50, 13, 'Bottle'),
    new StoreProduct('SP-002', 'S-001', 'rFSMHxCBcxmW53ecQFuvQzS8mqZcaW', 30, 17, 'Bottle'),
    new StoreProduct('SP-003', 'S-002', 'P75Lx5mwPw8EC02yY2fnTt8iUhAhe7', 20, 15, 'Bottle'), // Different price in Siam branch
  ];

  public async getProductsByStore(storeId: string): Promise<StoreProduct[]> {
    return this.storeProducts.filter(sp => sp.storeId === storeId);
  }

  public async updateStock(storeProductId: string, newStock: number): Promise<void> {
    const sp = this.storeProducts.find(s => s.id === storeProductId);
    if (sp) {
      sp.stock = newStock;
    }
  }

  public async updatePrice(storeProductId: string, newPrice: number): Promise<void> {
    const sp = this.storeProducts.find(s => s.id === storeProductId);
    if (sp) {
      sp.price = newPrice;
    }
  }
}
