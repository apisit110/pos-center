import { Merchant } from '../../domain/entities/Merchant';

export interface IMerchantRepository {
  getById(id: string): Promise<Merchant | null>;
  findAll(): Promise<Merchant[]>;
  save(merchant: Merchant): Promise<void>;
}
