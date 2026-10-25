import { MasterDataRef } from '../../domain/entities/Store';
import { MasterDataRepository } from '../../domain/repositories/MasterDataRepository';
import ApiClient, { API_V1, unwrap } from '../api/ApiClient';

const MASTER_DATA_PATH = `${API_V1}/master-data`;

interface MasterDataResponse {
  code: string;
  name_th: string;
  name_en: string;
}

const toMasterDataRef = (m: MasterDataResponse): MasterDataRef => ({ code: m.code, nameTh: m.name_th, nameEn: m.name_en });

export class ApiMasterDataRepository implements MasterDataRepository {
  public async getProvinces(): Promise<MasterDataRef[]> {
    const response = await ApiClient.get(`${MASTER_DATA_PATH}/provinces`);
    return unwrap<MasterDataResponse[]>(response).map(toMasterDataRef);
  }

  public async getDistricts(provinceCode: string): Promise<MasterDataRef[]> {
    const response = await ApiClient.get(`${MASTER_DATA_PATH}/districts`, { params: { province_code: provinceCode } });
    return unwrap<MasterDataResponse[]>(response).map(toMasterDataRef);
  }

  public async getSubDistricts(districtCode: string): Promise<MasterDataRef[]> {
    const response = await ApiClient.get(`${MASTER_DATA_PATH}/sub-districts`, { params: { district_code: districtCode } });
    return unwrap<MasterDataResponse[]>(response).map(toMasterDataRef);
  }

  public async getPostalCodes(subDistrictCode: string): Promise<string[]> {
    const response = await ApiClient.get(`${MASTER_DATA_PATH}/postal-codes`, { params: { sub_district_code: subDistrictCode } });
    return unwrap<{ code: string }[]>(response).map((p) => p.code);
  }
}
