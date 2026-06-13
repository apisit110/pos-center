import { Merchant } from '../../domain/entities/Merchant';

export interface IMerchantRepository {
  getById(uid: string): Promise<Merchant | null>;
  findAll(): Promise<Merchant[]>;
  save(merchant: Merchant): Promise<void>;
}
