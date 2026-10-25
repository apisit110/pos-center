import { Request, Response, NextFunction } from 'express';
import { GetAddressMasterDataUseCase } from '../../application/usecases/GetAddressMasterDataUseCase';
import {
  getDistrictsQuerySchema,
  getPostalCodesQuerySchema,
  getSubDistrictsQuerySchema,
} from '../dtos/request/MasterDataQueryDto';
import { toMasterDataResponseDto } from '../dtos/response/StoreResponseDto';
import { sendOk } from './respond';

export class MasterDataController {
  constructor(private getAddressMasterDataUseCase: GetAddressMasterDataUseCase) {}

  async getProvinces(req: Request, res: Response, next: NextFunction) {
    try {
      const provinces = await this.getAddressMasterDataUseCase.getProvinces();
      sendOk(res, provinces.map(toMasterDataResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getDistricts(req: Request, res: Response, next: NextFunction) {
    try {
      const { province_code } = getDistrictsQuerySchema.parse(req.query);
      const districts = await this.getAddressMasterDataUseCase.getDistricts(province_code);
      sendOk(res, districts.map(toMasterDataResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getSubDistricts(req: Request, res: Response, next: NextFunction) {
    try {
      const { district_code } = getSubDistrictsQuerySchema.parse(req.query);
      const subDistricts = await this.getAddressMasterDataUseCase.getSubDistricts(district_code);
      sendOk(res, subDistricts.map(toMasterDataResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getPostalCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub_district_code } = getPostalCodesQuerySchema.parse(req.query);
      const postalCodes = await this.getAddressMasterDataUseCase.getPostalCodes(sub_district_code);
      sendOk(res, postalCodes.map((code) => ({ code })));
    } catch (error) {
      next(error);
    }
  }
}
