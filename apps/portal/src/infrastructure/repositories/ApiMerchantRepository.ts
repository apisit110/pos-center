import { IssuedMerchantCredential, Merchant, MerchantCredentialProvider } from '../../domain/entities/Merchant';
import { AddressRequest, MerchantRepository, MerchantRegistrationRequest, MerchantFilter } from '../../domain/repositories/MerchantRepository';
import ApiClient, { API_V1, cleanParams, unwrap } from '../api/ApiClient';

const MERCHANTS_PATH = `${API_V1}/merchants`;

interface MerchantResponse {
  uid: string;
  partner_id: string;
  name_en: string;
  name_th: string;
  /** only in the merchant detail response */
  credentials?: { provider: string; client_id: string; created_at: string; updated_at: string }[];
}

const toMerchant = (m: MerchantResponse): Merchant => new Merchant(
  m.uid,
  m.partner_id,
  m.name_en,
  m.name_th,
  (m.credentials ?? []).map((c) => ({
    provider: c.provider,
    clientId: c.client_id,
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
  })),
);

/** create / rotate credential response, `client_secret` is only returned here */
interface IssuedCredentialResponse {
  provider: string;
  client_id: string;
  client_secret: string;
}

const toIssuedCredential = (c: IssuedCredentialResponse): IssuedMerchantCredential => ({
  provider: c.provider,
  clientId: c.client_id,
  clientSecret: c.client_secret,
});

const toAddressBody =(a: AddressRequest) => ({
  address_1: a.address1 || undefined,
  province_code: a.provinceCode,
  district_code: a.districtCode,
  sub_district_code: a.subDistrictCode,
  postal_code: a.postalCode,
  latitude: a.latitude === '' ? undefined : Number(a.latitude),
  longitude: a.longitude === '' ? undefined : Number(a.longitude),
});

export class ApiMerchantRepository implements MerchantRepository {
  public async getMerchant(uid: string): Promise<Merchant | null> {
    try {
      const response = await ApiClient.get(`${MERCHANTS_PATH}/${uid}`);
      return toMerchant(unwrap<MerchantResponse>(response));
    } catch {
      return null;
    }
  }

  public async getMerchants(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }> {
    const params = cleanParams({ page, limit, partner_id: filters?.partnerId, name: filters?.name });
    const response = await ApiClient.get(MERCHANTS_PATH, { params });
    const { items, total } = unwrap<{ items: MerchantResponse[]; total: number }>(response);
    return {
      merchants: items.map(toMerchant),
      total,
    };
  }

  public async registerMerchant(request: MerchantRegistrationRequest): Promise<Merchant> {
    // single request carrying staff, stores and terminals (see docs/portal/flow/merchant/post-merchant.md)
    const body = {
      name_en: request.merchantNameEn,
      name_th: request.merchantNameTh,
      cashier_staff: request.staffMembers.map((s) => ({
        full_name: s.fullName,
        pin: s.pin,
        role: s.role,
      })),
      stores: request.stores.map((store) => ({
        name_en: store.nameEn,
        name_th: store.nameTh,
        registered_address: toAddressBody(store.registeredAddress),
        contract_address: toAddressBody(store.contractAddress),
        terminals: store.terminals.map((t) => ({ name_en: t.nameEn, name_th: t.nameTh })),
      })),
    };
    const response = await ApiClient.post(MERCHANTS_PATH, body);
    return toMerchant(unwrap<MerchantResponse>(response));
  }

  public async createCredential(merchantUid: string, provider: MerchantCredentialProvider): Promise<IssuedMerchantCredential> {
    const response = await ApiClient.post(`${MERCHANTS_PATH}/${merchantUid}/credentials`, { provider });
    return toIssuedCredential(unwrap<IssuedCredentialResponse>(response));
  }

  public async rotateCredential(merchantUid: string, provider: MerchantCredentialProvider): Promise<IssuedMerchantCredential> {
    const response = await ApiClient.post(`${MERCHANTS_PATH}/${merchantUid}/credentials/rotate`, { provider });
    return toIssuedCredential(unwrap<IssuedCredentialResponse>(response));
  }
}
