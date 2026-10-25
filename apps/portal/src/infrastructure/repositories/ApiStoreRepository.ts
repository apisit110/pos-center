import { MasterDataRef, Store, StoreAddress } from '../../domain/entities/Store';
import { StoreRepository } from '../../domain/repositories/StoreRepository';
import ApiClient, { API_V1, cleanParams, unwrap } from '../api/ApiClient';

const STORES_PATH = `${API_V1}/stores`;

interface MasterDataResponse {
  code: string;
  name_th: string;
  name_en: string;
}

interface StoreAddressResponse {
  address_1: string;
  province: MasterDataResponse;
  district: MasterDataResponse;
  sub_district: MasterDataResponse;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
}

interface StoreResponse {
  uid: string;
  sid: string;
  merchant_uid: string;
  partner_id: string;
  name_en: string;
  name_th: string;
  registered_address: StoreAddressResponse | null;
  contract_address: StoreAddressResponse | null;
}

const toMasterDataRef = (m: MasterDataResponse): MasterDataRef => ({ code: m.code, nameTh: m.name_th, nameEn: m.name_en });

const toStoreAddress = (a: StoreAddressResponse | null): StoreAddress | null =>
  a && {
    address1: a.address_1 ?? '',
    province: toMasterDataRef(a.province),
    district: toMasterDataRef(a.district),
    subDistrict: toMasterDataRef(a.sub_district),
    postalCode: a.postal_code ?? '',
    latitude: a.latitude,
    longitude: a.longitude,
  };

const toStore = (s: StoreResponse): Store =>
  new Store(
    s.uid,
    s.sid,
    s.merchant_uid,
    s.partner_id,
    s.name_en,
    s.name_th,
    toStoreAddress(s.registered_address),
    toStoreAddress(s.contract_address),
  );

export class ApiStoreRepository implements StoreRepository {
  public async getStores(merchantId?: string): Promise<Store[]> {
    const params = cleanParams({ merchant_uid: merchantId });
    const response = await ApiClient.get(STORES_PATH, { params });
    return unwrap<StoreResponse[]>(response).map(toStore);
  }

  public async getStoreById(uid: string): Promise<Store | null> {
    try {
      const response = await ApiClient.get(`${STORES_PATH}/${uid}`);
      return toStore(unwrap<StoreResponse>(response));
    } catch {
      return null;
    }
  }
}
