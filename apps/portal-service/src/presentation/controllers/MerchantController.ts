import { Request, Response, NextFunction } from 'express';
import { GetMerchantsUseCase } from '../../application/usecases/GetMerchantsUseCase';
import { GetMerchantDetailUseCase } from '../../application/usecases/GetMerchantDetailUseCase';
import { RegisterMerchantUseCase } from '../../application/usecases/RegisterMerchantUseCase';
import { GetStaffByMerchantUseCase } from '../../application/usecases/GetStaffByMerchantUseCase';
import { registerMerchantSchema } from '../dtos/request/RegisterMerchantRequestDto';
import { toMerchantResponseDto } from '../dtos/response/MerchantResponseDto';

export class MerchantController {
  constructor(
    private getMerchantsUseCase: GetMerchantsUseCase,
    private getMerchantDetailUseCase: GetMerchantDetailUseCase,
    private registerMerchantUseCase: RegisterMerchantUseCase,
    private getStaffByMerchantUseCase: GetStaffByMerchantUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const merchants = await this.getMerchantsUseCase.execute();
      res.json(merchants.map(toMerchantResponseDto));
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
