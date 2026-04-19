import { Request, Response, NextFunction } from 'express';
import { GetMerchantsUseCase } from '../../application/use-cases/GetMerchantsUseCase';
import { GetMerchantDetailUseCase } from '../../application/use-cases/GetMerchantDetailUseCase';

export class MerchantController {
  constructor(
    private getMerchantsUseCase: GetMerchantsUseCase,
    private getMerchantDetailUseCase: GetMerchantDetailUseCase
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
      const { id } = req.params;
      const merchant = await this.getMerchantDetailUseCase.execute(id);
      if (!merchant) {
        return res.status(404).json({ message: 'Merchant not found' });
      }
      res.json(merchant);
    } catch (error) {
      next(error);
    }
  }
}
