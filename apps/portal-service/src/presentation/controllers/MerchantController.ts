import { Request, Response, NextFunction } from 'express';
import { GetMerchantsUseCase } from '../../application/usecases/GetMerchantsUseCase';
import { GetMerchantDetailUseCase } from '../../application/usecases/GetMerchantDetailUseCase';
import { CreateMerchantUseCase } from '../../application/usecases/CreateMerchantUseCase';
import { GetStaffByMerchantUseCase } from '../../application/usecases/GetStaffByMerchantUseCase';
import { CreateMerchantCredentialUseCase } from '../../application/usecases/CreateMerchantCredentialUseCase';
import { RotateMerchantCredentialUseCase } from '../../application/usecases/RotateMerchantCredentialUseCase';
import { getMerchantsQuerySchema } from '../dtos/request/GetMerchantsQueryDto';
import { idParamSchema } from '../dtos/request/CommonRequestDto';
import { AddressRequestDto, createMerchantSchema } from '../dtos/request/CreateMerchantRequestDto';
import { merchantCredentialBodySchema } from '../dtos/request/MerchantCredentialRequestDto';
import {
  toCreateMerchantCredentialResponseDto,
  toCreateMerchantResponseDto,
  toMerchantDetailResponseDto,
  toMerchantResponseDto,
  toRotateMerchantCredentialResponseDto,
} from '../dtos/response/MerchantResponseDto';
import { AddressInput } from '../../domain/repositories/IAddressRepository';
import { toMerchantStaffResponseDto } from '../dtos/response/StaffResponseDto';
import { toPaginatedResponseDto } from '../dtos/response/PaginatedResponseDto';
import { actorOf } from '../middleware/AuthMiddleware';
import { sendOk } from './respond';

const toAddressInput = (address: AddressRequestDto): AddressInput => ({
  address1: address.address_1,
  provinceCode: address.province_code,
  districtCode: address.district_code,
  subDistrictCode: address.sub_district_code,
  postalCode: address.postal_code,
  latitude: address.latitude,
  longitude: address.longitude,
});

export class MerchantController {
  constructor(
    private getMerchantsUseCase: GetMerchantsUseCase,
    private getMerchantDetailUseCase: GetMerchantDetailUseCase,
    private createMerchantUseCase: CreateMerchantUseCase,
    private getStaffByMerchantUseCase: GetStaffByMerchantUseCase,
    private createMerchantCredentialUseCase: CreateMerchantCredentialUseCase,
    private rotateMerchantCredentialUseCase: RotateMerchantCredentialUseCase,
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getMerchantsQuerySchema.parse(req.query);
      const result = await this.getMerchantsUseCase.execute(actorOf(req), {
        page: query.page,
        limit: query.limit,
        partnerId: query.partner_id,
        name: query.name,
      });
      sendOk(res, toPaginatedResponseDto(result.merchants, result.total, result.page, result.limit, toMerchantResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const detail = await this.getMerchantDetailUseCase.execute(actorOf(req), id);
      sendOk(res, toMerchantDetailResponseDto(detail));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createMerchantSchema.parse(req.body);
      const result = await this.createMerchantUseCase.execute({
        nameEn: body.name_en,
        nameTh: body.name_th,
        cashierStaff: body.cashier_staff.map((staff) => ({ fullName: staff.full_name, pin: staff.pin, role: staff.role })),
        stores: body.stores.map((store) => ({
          nameEn: store.name_en,
          nameTh: store.name_th,
          registeredAddress: toAddressInput(store.registered_address),
          contractAddress: toAddressInput(store.contract_address),
          terminals: store.terminals.map((terminal) => ({ nameEn: terminal.name_en, nameTh: terminal.name_th })),
        })),
      });
      sendOk(res, toCreateMerchantResponseDto(result), 201);
    } catch (error) {
      next(error);
    }
  }

  async createCredential(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const { provider } = merchantCredentialBodySchema.parse(req.body ?? {});
      const issued = await this.createMerchantCredentialUseCase.execute(id, provider);
      sendOk(res, toCreateMerchantCredentialResponseDto(issued), 201);
    } catch (error) {
      next(error);
    }
  }

  async rotateCredential(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const { provider } = merchantCredentialBodySchema.parse(req.body ?? {});
      const issued = await this.rotateMerchantCredentialUseCase.execute(id, provider);
      sendOk(res, toRotateMerchantCredentialResponseDto(issued));
    } catch (error) {
      next(error);
    }
  }

  async getStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const staffList = await this.getStaffByMerchantUseCase.execute(actorOf(req), id);
      sendOk(res, staffList.map(toMerchantStaffResponseDto));
    } catch (error) {
      next(error);
    }
  }
}
