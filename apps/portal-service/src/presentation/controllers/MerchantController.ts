import { Request, Response, NextFunction } from 'express';
import { GetMerchantsUseCase } from '../../application/usecases/GetMerchantsUseCase';
import { GetMerchantDetailUseCase } from '../../application/usecases/GetMerchantDetailUseCase';
import { RegisterMerchantUseCase } from '../../application/usecases/RegisterMerchantUseCase';
import { GetStaffByMerchantUseCase } from '../../application/usecases/GetStaffByMerchantUseCase';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { registerMerchantSchema } from '../dtos/request/RegisterMerchantRequestDto';
import { getMerchantsQuerySchema } from '../dtos/request/GetMerchantsQueryDto';
import { toMerchantResponseDto } from '../dtos/response/MerchantResponseDto';
import { PaginatedResponseDto } from '../dtos/response/PaginatedResponseDto';
import { SUPER_ADMIN_ROLE } from '../../domain/constants/roles';

export class MerchantController {
  constructor(
    private getMerchantsUseCase: GetMerchantsUseCase,
    private getMerchantDetailUseCase: GetMerchantDetailUseCase,
    private registerMerchantUseCase: RegisterMerchantUseCase,
    private getStaffByMerchantUseCase: GetStaffByMerchantUseCase,
    private staffRepository: IStaffRepository
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, mid, name } = getMerchantsQuerySchema.parse(req.query);

      // Non-super-admin staff may only ever see their own merchant, never the full list.
      if (req.auth?.role !== SUPER_ADMIN_ROLE) {
        const ownMerchantUid = req.auth ? await this.staffRepository.getMerchantUidByStaffId(req.auth.uid) : null;
        const ownMerchant = ownMerchantUid ? await this.getMerchantDetailUseCase.execute(ownMerchantUid) : null;
        const items = ownMerchant ? [toMerchantResponseDto(ownMerchant)] : [];
        const response: PaginatedResponseDto<ReturnType<typeof toMerchantResponseDto>> = {
          items,
          total: items.length,
          page: 1,
          limit: items.length,
        };
        return res.json(response);
      }

      const result = await this.getMerchantsUseCase.execute(page, limit, { mid, name });
      const response: PaginatedResponseDto<ReturnType<typeof toMerchantResponseDto>> = {
        items: result.merchants.map(toMerchantResponseDto),
        total: result.total,
        page,
        limit,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: uid } = req.params;
      const merchant = await this.getMerchantDetailUseCase.execute(uid);
      if (!merchant) {
        return res.status(404).json({ message: 'Merchant not found' });
      }
      res.json(toMerchantResponseDto(merchant));
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request = registerMerchantSchema.parse(req.body);
      const merchant = await this.registerMerchantUseCase.execute(request);
      res.status(201).json(toMerchantResponseDto(merchant));
    } catch (error) {
      next(error);
    }
  }

  async getStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: uid } = req.params;
      const staffList = await this.getStaffByMerchantUseCase.execute(uid);
      res.json(staffList.map(s => ({
        uid: s.id,
        name: s.name,
        role: s.role,
        username: s.username ?? '',
        status: s.status,
      })));
    } catch (error) {
      next(error);
    }
  }
}
