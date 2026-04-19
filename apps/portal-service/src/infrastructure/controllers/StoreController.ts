import { Request, Response, NextFunction } from 'express';
import { GetStoresUseCase } from '../../application/use-cases/GetStoresUseCase';
import { GetStoreDetailUseCase } from '../../application/use-cases/GetStoreDetailUseCase';

export class StoreController {
  constructor(
    private getStoresUseCase: GetStoresUseCase,
    private getStoreDetailUseCase: GetStoreDetailUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const stores = await this.getStoresUseCase.execute();
      res.json(stores);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const store = await this.getStoreDetailUseCase.execute(id);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
      res.json(store);
    } catch (error) {
      next(error);
    }
  }
}
