import { MasterDataRef, Store, StoreAddress } from '../../../domain/entities/Store';

export interface MasterDataResponseDto {
  code: string;
  name_th: string;
  name_en: string;
}

export interface StoreAddressResponseDto {
  address_1: string;
  province: MasterDataResponseDto;
  district: MasterDataResponseDto;
  sub_district: MasterDataResponseDto;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
}

export interface StoreResponseDto {
  uid: string;
  sid: string;
  merchant_uid: string;
  partner_id: string;
  name_en: string;
  name_th: string;
  registered_address: StoreAddressResponseDto | null;
  contract_address: StoreAddressResponseDto | null;
}

export const toMasterDataResponseDto =(ref: MasterDataRef): MasterDataResponseDto => ({
  code: ref.code,
  name_th: ref.nameTh,
  name_en: ref.nameEn,
});

const toStoreAddressResponseDto = (address: StoreAddress | null): StoreAddressResponseDto | null =>
  address && {
    address_1: address.address1,
    province: toMasterDataResponseDto(address.province),
    district: toMasterDataResponseDto(address.district),
    sub_district: toMasterDataResponseDto(address.subDistrict),
    postal_code: address.postalCode,
    latitude: address.latitude,
    longitude: address.longitude,
  };

export function toStoreResponseDto(store: Store): StoreResponseDto {
  return {
    uid: store.uid,
    sid: store.sid,
    merchant_uid: store.merchantId,
    partner_id: store.partnerId,
    name_en: store.nameEn,
    name_th: store.nameTh,
    registered_address: toStoreAddressResponseDto(store.registeredAddress),
    contract_address: toStoreAddressResponseDto(store.contractAddress),
  };
}
