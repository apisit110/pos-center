import axios from 'axios';
import { Merchant } from '../../domain/entities/Merchant';
import { MerchantRepository } from '../../application/repositories/MerchantRepository';

export class MockMerchantRepository implements MerchantRepository {
  private merchants: Merchant[] = [];
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;
    try {
      const response = await axios.get('/constants/master_merchant.json');
      const data = response.data;
      this.merchants = data.map((m: any) => new Merchant(String(m.id), m.name));
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load merchant master data:', error);
    }
  }

  public async getMerchant(id: string): Promise<Merchant | null> {
    await this.initialize();
    return this.merchants.find(m => m.id === id) || null;
  }

  public async getMerchants(): Promise<Merchant[]> {
    await this.initialize();
    return this.merchants;
  }

  public async updateMerchant(merchant: Merchant): Promise<void> {
    await this.initialize();
    const index = this.merchants.findIndex(m => m.id === merchant.id);
    if (index !== -1) {
      this.merchants[index] = merchant;
    }
  }
}
