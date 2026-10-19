import { Store } from '../../../domain/entities/Store';

export interface StoreResponseDto {
  uid: string;
  sid: string;
  merchant_uid: string;
  mid: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export function toStoreResponseDto(store: Store): StoreResponseDto {
  return {
    uid: store.uid,
    sid: store.sid,
    merchant_uid: store.merchantId,
    mid: store.mid,
    name: store.name,
    address: store.address,
    latitude: store.latitude,
    longitude: store.longitude,
  };
}
