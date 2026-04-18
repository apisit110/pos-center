import { Merchant } from '../../domain/entities/Merchant';

export interface MerchantRepository {
  getMerchant(id: string): Promise<Merchant | null>;
  updateMerchant(merchant: Merchant): Promise<void>;
}
