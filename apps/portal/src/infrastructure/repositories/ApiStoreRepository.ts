import { Store } from '../../domain/entities/Store';
import { StoreRepository } from '../../domain/repositories/StoreRepository';
import ApiClient, { API_V1, cleanParams, unwrap } from '../api/ApiClient';

const STORES_PATH = `${API_V1}/stores`;

interface StoreResponse {
  uid: string;
  sid: string;
  merchant_uid: string;
  mid: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const toStore = (s: StoreResponse): Store =>
  new Store(s.uid, s.sid, s.merchant_uid, s.mid, s.name, s.address, s.latitude || 0, s.longitude || 0);

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
