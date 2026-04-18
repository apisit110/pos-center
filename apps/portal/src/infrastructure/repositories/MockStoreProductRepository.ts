import axios from 'axios';
import { StoreProduct } from '../../domain/entities/StoreProduct';
import { StoreProductRepository } from '../../application/repositories/StoreProductRepository';

export class MockStoreProductRepository implements StoreProductRepository {
  private storeProducts: StoreProduct[] = [];
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;
    try {
      const response = await axios.get('/constants/master_store_product.json');
      const data = response.data;
      this.storeProducts = data.map((sp: any) => new StoreProduct(
        sp.id,
        sp.store_id,
        sp.product_id,
        sp.stock,
        sp.price,
        sp.unit
      ));
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load store product master data:', error);
    }
  }

  public async getProductsByStore(storeId: string): Promise<StoreProduct[]> {
    await this.initialize();
    return this.storeProducts.filter(sp => sp.storeId === storeId);
  }

  public async updateStock(storeProductId: string, newStock: number): Promise<void> {
    await this.initialize();
    const sp = this.storeProducts.find(s => s.id === storeProductId);
    if (sp) {
      sp.stock = newStock;
    }
  }

  public async updatePrice(storeProductId: string, newPrice: number): Promise<void> {
    await this.initialize();
    const sp = this.storeProducts.find(s => s.id === storeProductId);
    if (sp) {
      sp.price = newPrice;
    }
  }
}
