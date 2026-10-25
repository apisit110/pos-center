import { MasterDataRef } from '../entities/Store';

/** Address master data, see docs/portal/flow/master-data/get-address-master-data.md */
export interface MasterDataRepository {
  getProvinces(): Promise<MasterDataRef[]>;
  getDistricts(provinceCode: string): Promise<MasterDataRef[]>;
  getSubDistricts(districtCode: string): Promise<MasterDataRef[]>;
  getPostalCodes(subDistrictCode: string): Promise<string[]>;
}
