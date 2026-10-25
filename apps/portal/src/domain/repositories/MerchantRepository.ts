import { IssuedMerchantCredential, Merchant, MerchantCredentialProvider } from '../../domain/entities/Merchant';

export interface StaffRequest {
  fullName: string;
  pin: string;
  role: 'manager' | 'cashier';
}

/** codes of the master data (provinces, districts, sub_districts, postal_code) */
export interface AddressRequest {
  address1: string;
  provinceCode: string;
  districtCode: string;
  subDistrictCode: string;
  postalCode: string;
  /** empty string when not set; latitude and longitude must be both set or both empty */
  latitude: string;
  longitude: string;
}

export interface MerchantRegistrationRequest {
  merchantNameEn: string;
  merchantNameTh: string;
  staffMembers: StaffRequest[];
  stores: {
    nameEn: string;
    nameTh: string;
    registeredAddress: AddressRequest;
    contractAddress: AddressRequest;
    terminals: {
      nameEn: string;
      nameTh: string;
    }[];
  }[];
}

export interface MerchantFilter {
  partnerId?: string;
  name?: string;
}

export interface MerchantRepository {
  getMerchant(uid: string): Promise<Merchant | null>;
  getMerchants(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }>;
  registerMerchant(request: MerchantRegistrationRequest): Promise<Merchant>;
  createCredential(merchantUid: string, provider: MerchantCredentialProvider): Promise<IssuedMerchantCredential>;
  rotateCredential(merchantUid: string, provider: MerchantCredentialProvider): Promise<IssuedMerchantCredential>;
}
