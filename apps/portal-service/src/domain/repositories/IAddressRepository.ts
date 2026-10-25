import { MasterDataRef } from '../entities/Store';

export interface AddressInput {
  address1?: string;
  provinceCode: string;
  districtCode: string;
  subDistrictCode: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

/** Address with the master data codes resolved to ids, ready to be saved. */
export interface ResolvedAddress {
  provinceId: number;
  districtId: number;
  subDistrictId: number;
  postalCodeId: number;
  address1: string | null;
  latitude: number | null;
  longitude: number | null;
}

export type ResolveAddressResult =
  | { ok: true; address: ResolvedAddress }
  /** `field` is the request field of the code that is not found or does not belong to its parent */
  | { ok: false; field: string; message: string };

export interface IAddressRepository {
  /** Resolves the codes from master data; the chain must match (district in province, sub district in district, postal code in sub district). */
  resolve(input: AddressInput): Promise<ResolveAddressResult>;

  /** Master data for the address select options, ordered by name_th ascending. */
  listProvinces(): Promise<MasterDataRef[]>;
  /** Districts of the province (by province code), empty when the province is not found. */
  listDistricts(provinceCode: string): Promise<MasterDataRef[]>;
  /** Sub districts of the district (by district code), empty when the district is not found. */
  listSubDistricts(districtCode: string): Promise<MasterDataRef[]>;
  /** Postal codes of the sub district (by sub district code), ascending, empty when the sub district is not found. */
  listPostalCodes(subDistrictCode: string): Promise<string[]>;
}
