import { Merchant } from '../../domain/entities/Merchant';

export interface MerchantFilter {
  mid?: string;
  name?: string;
}

export interface IMerchantRepository {
  getById(uid: string): Promise<Merchant | null>;
  getByMid(mid: string): Promise<Merchant | null>;
  /** Ordered by internal id ascending. */
  findAll(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }>;
  save(merchant: Merchant): Promise<void>;
}
