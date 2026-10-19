import { Request, Response, NextFunction } from 'express';
import { GetMerchantsUseCase } from '../../application/usecases/GetMerchantsUseCase';
import { GetMerchantDetailUseCase } from '../../application/usecases/GetMerchantDetailUseCase';
import { CreateMerchantUseCase } from '../../application/usecases/CreateMerchantUseCase';
import { GetStaffByMerchantUseCase } from '../../application/usecases/GetStaffByMerchantUseCase';
import { createMerchantSchema } from '../dtos/request/CreateMerchantRequestDto';
import { getMerchantsQuerySchema } from '../dtos/request/GetMerchantsQueryDto';
import { idParamSchema } from '../dtos/request/CommonRequestDto';
import { toMerchantResponseDto } from '../dtos/response/MerchantResponseDto';
import { toMerchantStaffResponseDto } from '../dtos/response/StaffResponseDto';
import { toPaginatedResponseDto } from '../dtos/response/PaginatedResponseDto';
import { actorOf } from '../middleware/AuthMiddleware';
import { sendOk } from './respond';

export class MerchantController {
  constructor(
    private getMerchantsUseCase: GetMerchantsUseCase,
    private getMerchantDetailUseCase: GetMerchantDetailUseCase,
    private createMerchantUseCase: CreateMerchantUseCase,
    private getStaffByMerchantUseCase: GetStaffByMerchantUseCase,
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getMerchantsQuerySchema.parse(req.query);
      const result = await this.getMerchantsUseCase.execute(actorOf(req), query);
      sendOk(res, toPaginatedResponseDto(result.merchants, result.total, result.page, result.limit, toMerchantResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const merchant = await this.getMerchantDetailUseCase.execute(actorOf(req), id);
      sendOk(res, toMerchantResponseDto(merchant));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createMerchantSchema.parse(req.body);
      const merchant = await this.createMerchantUseCase.execute({
        name: body.name,
        staffMembers: body.staff_members.map((staff) => ({ fullName: staff.full_name, pin: staff.pin, role: staff.role })),
        stores: body.stores,
      });
      sendOk(res, toMerchantResponseDto(merchant), 201);
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
