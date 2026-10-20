import { Merchant } from '../../domain/entities/Merchant';
import { Staff } from '../../domain/entities/Staff';
import { Store } from '../../domain/entities/Store';
import { Terminal } from '../../domain/entities/Terminal';

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
  /** Saves the merchant with its staff, stores and terminals in one transaction (all or nothing). */
  createWithMembers(
    merchant: Merchant,
    staffMembers: Staff[],
    stores: { store: Store; terminals: Terminal[] }[],
  ): Promise<void>;
}
