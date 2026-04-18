import { Merchant } from '../../domain/entities/Merchant';

export interface MerchantRepository {
  getMerchant(id: string): Promise<Merchant | null>;
  getMerchants(): Promise<Merchant[]>;
  updateMerchant(merchant: Merchant): Promise<void>;
}
