import { MasterDataRef } from '../../domain/entities/Store';
import { IAddressRepository } from '../../domain/repositories/IAddressRepository';

/** Address master data (province -> district -> sub district -> postal code) for the select options of the address form. */
export class GetAddressMasterDataUseCase {
  constructor(private addressRepository: IAddressRepository) {}

  getProvinces(): Promise<MasterDataRef[]> {
    return this.addressRepository.listProvinces();
  }

  getDistricts(provinceCode: string): Promise<MasterDataRef[]> {
    return this.addressRepository.listDistricts(provinceCode);
  }

  getSubDistricts(districtCode: string): Promise<MasterDataRef[]> {
    return this.addressRepository.listSubDistricts(districtCode);
  }

  getPostalCodes(subDistrictCode: string): Promise<string[]> {
    return this.addressRepository.listPostalCodes(subDistrictCode);
  }
}
