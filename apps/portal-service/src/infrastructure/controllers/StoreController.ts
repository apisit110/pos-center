import { Request, Response, NextFunction } from 'express';
import { GetStoresUseCase } from '../../domain/usecases/GetStoresUseCase';
import { GetStoreDetailUseCase } from '../../domain/usecases/GetStoreDetailUseCase';
import { GetTerminalsByStoreUseCase } from '../../domain/usecases/GetTerminalsByStoreUseCase';

export class StoreController {
  constructor(
    private getStoresUseCase: GetStoresUseCase,
    private getStoreDetailUseCase: GetStoreDetailUseCase,
    private getTerminalsByStoreUseCase: GetTerminalsByStoreUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId } = req.query;
      const stores = await this.getStoresUseCase.execute(merchantId as string);
      res.json(stores);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: uid } = req.params;
      const store = await this.getStoreDetailUseCase.execute(uid);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
      res.json(store);
    } catch (error) {
      next(error);
    }
  }

  async getTerminals(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: storeId } = req.params;
      const terminals = await this.getTerminalsByStoreUseCase.execute(storeId);
      res.json(terminals);
    } catch (error) {
      next(error);
    }
  }
}
