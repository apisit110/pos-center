import { Merchant } from '../../domain/entities/Merchant';

export interface StaffRequest {
  fullName: string;
  pin: string;
  role: 'manager' | 'cashier';
}

export interface MerchantRegistrationRequest {
  merchantName: string;
  staffMembers: StaffRequest[];
  stores: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    terminals: {
      name: string;
    }[];
  }[];
}

export interface MerchantRepository {
  getMerchant(uid: string): Promise<Merchant | null>;
  getMerchants(): Promise<Merchant[]>;
  updateMerchant(merchant: Merchant): Promise<void>;
  registerMerchant(request: MerchantRegistrationRequest): Promise<Merchant>;
}
