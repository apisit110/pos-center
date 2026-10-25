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

export class Store {
  constructor(
    public readonly uid: string,
    public readonly sid: string,
    public readonly merchantId: string,
    public readonly partnerId: string,
    public nameEn: string,
    public nameTh: string,
    public registeredAddress: StoreAddress | null = null,
    public contractAddress: StoreAddress | null = null
  ) {}
}
