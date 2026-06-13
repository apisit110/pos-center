import { Request, Response, NextFunction } from 'express';
import { GetMerchantsUseCase } from '../../domain/usecases/GetMerchantsUseCase';
import { GetMerchantDetailUseCase } from '../../domain/usecases/GetMerchantDetailUseCase';
import { RegisterMerchantUseCase } from '../../domain/usecases/RegisterMerchantUseCase';
import { GetStaffByMerchantUseCase } from '../../domain/usecases/GetStaffByMerchantUseCase';

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
      res.json(merchants);
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
      res.json(merchant);
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const merchant = await this.registerMerchantUseCase.execute(req.body);
      res.status(201).json(merchant);
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
