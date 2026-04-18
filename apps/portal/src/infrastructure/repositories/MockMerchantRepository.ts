import { Merchant } from '../../domain/entities/Merchant';
import { MerchantRepository } from '../../application/repositories/MerchantRepository';

export class MockMerchantRepository implements MerchantRepository {
  private merchants: Merchant[] = [
    new Merchant('M-123', 'Lightning Coffee'),
    new Merchant('M-456', 'Super Bakery')
  ];

  public async getMerchant(id: string): Promise<Merchant | null> {
    return this.merchants.find(m => m.id === id) || null;
  }

  public async updateMerchant(merchant: Merchant): Promise<void> {
    const index = this.merchants.findIndex(m => m.id === merchant.id);
    if (index !== -1) {
      this.merchants[index] = merchant;
    }
  }
}
