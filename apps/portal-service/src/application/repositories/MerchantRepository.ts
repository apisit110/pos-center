import { Merchant } from '../../domain/entities/Merchant';

export interface MerchantRepository {
  getById(id: string): Promise<Merchant | null>;
  findAll(): Promise<Merchant[]>;
  save(merchant: Merchant): Promise<void>;
}
