import { NameLanguage, pickName } from './LocalizedName';

export interface MasterDataRef {
  code: string;
  nameTh: string;
  nameEn: string;
}

export interface StoreAddress {
  address1: string;
  province: MasterDataRef;
  district: MasterDataRef;
  subDistrict: MasterDataRef;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
}

/** one line address (address 1, sub district, district, province, postal code) in the given UI language */
export const formatStoreAddress = (address: StoreAddress | null, language: NameLanguage): string => {
  if (!address) return '';
  const name = (ref: MasterDataRef) => pickName(language, ref.nameEn, ref.nameTh);
  return [address.address1, name(address.subDistrict), name(address.district), name(address.province), address.postalCode]
    .filter(Boolean)
    .join(' ');
};

export class Store {
  constructor(
    public readonly uid: string,
    public readonly sid: string,
    public readonly merchantId: string,
    public readonly partnerId: string,
    public nameEn: string,
    public nameTh: string,
    public registeredAddress: StoreAddress | null,
    public contractAddress: StoreAddress | null
  ) {}

  public displayName(language: NameLanguage): string {
    return pickName(language, this.nameEn, this.nameTh);
  }
}
