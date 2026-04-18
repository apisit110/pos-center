import { Merchant } from '../../domain/entities/Merchant';

export interface MerchantRepository {
  getById(id: string): Promise<Merchant | null>;
  save(merchant: Merchant): Promise<void>;
}
